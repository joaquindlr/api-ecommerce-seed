import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginAuthDto } from './dto/login-auth.dto';
import { KafkaService } from 'src/kafka/kafka.service';
import { confirmationCodeGenerator } from 'src/common/utils/confirmationCodeGenerator';
import {
  codeIsExpired,
  expirationDateGenerator,
} from 'src/common/utils/expirationDateGenerator';
import { ConfirmMailDto } from './dto/confirm-mail-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly kafkaService: KafkaService,
  ) {}

  async register(userObject: RegisterAuthDto) {
    const findUser = await this.usersRepository.findOneBy({
      email: userObject.email,
    });
    if (findUser) throw new HttpException('EMAIL_IN_USE', HttpStatus.CONFLICT);

    const { password } = userObject;
    const plainToHash = await hash(password, 10);

    const confirmationCode = confirmationCodeGenerator();

    const confirmationCodeExpirationDate = expirationDateGenerator();

    const newUserObject = {
      ...userObject,
      password: plainToHash,
      confirmationCode,
      confirmationCodeExpirationDate,
    };

    const user = new User(newUserObject);
    const newUser = await this.usersRepository.save(user);

    await this.kafkaService.sendRegisterUserMail(newUserObject);

    return { msg: 'user created: ' + newUser.email };
  }

  async login(userObject: LoginAuthDto) {
    const { email, password } = userObject;
    const findUser = await this.usersRepository.findOneBy({ email });
    if (!findUser)
      throw new HttpException('CREDENTIALS_ERROR', HttpStatus.UNAUTHORIZED);

    const checkPassowrd = await compare(password, findUser.password);
    if (!checkPassowrd)
      throw new HttpException('CREDENTIALS_ERROR', HttpStatus.UNAUTHORIZED);

    console.log(findUser);
    if (!findUser.mailConfirmed) {
      throw new HttpException('MAIL_NO_CONFIRMED', HttpStatus.FORBIDDEN);
    }

    const payload = {
      id: findUser.id,
      email: findUser.email,
      username: findUser.username,
    };

    const token = await this.jwtService.sign(payload);

    const data = {
      token,
    };
    return data;
  }

  async confirmMail(confimationObject: ConfirmMailDto) {
    const findUser = await this.usersRepository.findOneBy({
      email: confimationObject.email,
    });
    if (!findUser)
      throw new HttpException('EMAIL_NOT_FOUND', HttpStatus.UNAUTHORIZED);

    if (!findUser.confirmationCodeExpirationDate || !findUser.confirmationCode)
      throw new HttpException(
        'MAIL_ALREADY_CONFIRMED',
        HttpStatus.UNAUTHORIZED,
      );

    if (findUser.confirmationCode !== confimationObject.confirmationCode)
      throw new HttpException('INCORRECT_CODE', HttpStatus.UNAUTHORIZED);

    if (codeIsExpired(findUser.confirmationCodeExpirationDate))
      throw new HttpException('CODE_IS_EXPIRED', HttpStatus.UNAUTHORIZED);

    await this.usersRepository.update(
      { id: findUser.id },
      {
        mailConfirmed: true,
        confirmationCode: 0,
        confirmationCodeExpirationDate: '',
      },
    );

    return { msg: 'Email are confirmed.' };
  }
}
