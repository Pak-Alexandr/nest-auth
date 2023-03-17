import { IsEmail } from 'class-validator';

export class CreateUserDto {
  readonly individualIdentificationNumber: string;
  @IsEmail({}, { message: 'Неверный формат email' })
  readonly email: string;
  readonly fullName: string;
  readonly account: string;
  password: string;
}
