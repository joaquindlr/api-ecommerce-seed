import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async register(userObject: RegisterAuthDto) {
    const findUser = await this.usersRepository.findOneBy({
      email: userObject.email,
    });
    if (findUser) throw new HttpException('EMAIL_IN_USE', HttpStatus.CONFLICT);
    const { password } = userObject;
    const plainToHash = await hash(password, 10);
    userObject = { ...userObject, password: plainToHash };
    const user = new User(userObject);
    const newUser = await this.usersRepository.save(user);
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
}
