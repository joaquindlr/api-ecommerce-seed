import { IsEmail, IsNumber } from 'class-validator';

export class ConfirmMailDto {
  @IsEmail()
  email: string;

  @IsNumber()
  confirmationCode: number;
}
