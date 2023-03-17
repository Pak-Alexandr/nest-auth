import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserModel } from './entities/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { AuthLoginDto } from './dto/auth-login.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel) private userRepository: typeof UserModel,
  ) {}
  async getAllUsers(queryParams: GetAllUsersDto): Promise<CreateUserDto[]> {
    const allUsers = await this.userRepository.findAll({
      limit: queryParams.limit,
      offset: queryParams.offset,
    });
    if (allUsers.length === 0) {
      throw new HttpException('Пользователи не найдены', HttpStatus.NOT_FOUND);
    }
    return allUsers;
  }
  async getUserById(userId: number): Promise<CreateUserDto> {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  async createNewUser(createUserDto: CreateUserDto): Promise<CreateUserDto> {
    const user = createUserDto;

    const findUserByIIN = await this.userRepository.findOne({
      where: {
        individualIdentificationNumber:
          createUserDto.individualIdentificationNumber,
      },
    });
    if (findUserByIIN) {
      throw new HttpException(
        'Пользователь с указанным ИИН уже зарегистрирован',
        HttpStatus.BAD_REQUEST,
      );
    }
    const findUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (findUserByEmail) {
      throw new HttpException(
        'Пользователь с указанным email уже зарегистрирован',
        HttpStatus.BAD_REQUEST,
      );
    }
    const findUserByAccount = await this.userRepository.findOne({
      where: { account: createUserDto.account },
    });
    if (findUserByAccount) {
      throw new HttpException(
        'Пользователь с указанным account уже зарегистрирован',
        HttpStatus.BAD_REQUEST,
      );
    }
    function isValidIIN(iin: string): boolean {
      if (iin.length !== 12) {
        return false;
      }
      const year = iin.substring(0, 2);
      const month = iin.substring(2, 2);
      const day = iin.substring(4, 2);
      const date = new Date(`${year}-${month}-${day}`);

      if (isNaN(date.getTime())) {
        return false;
      }

      const regionCode = parseInt(iin.substring(9, 2));
      if (regionCode < 1 || regionCode > 17) {
        return false;
      }

      const controlSum = parseInt(iin.substring(11, 1));
      let sum = 0;
      for (let i = 0; i < 11; i++) {
        sum += parseInt(iin[i]) * ((i % 8) + 2);
      }

      const remainder = sum % 11;
      const checkDigit = remainder < 10 ? remainder : 0;
      return checkDigit === controlSum;
    }
    if (!isValidIIN(createUserDto.individualIdentificationNumber)) {
      throw new HttpException(
        'ИИН не соответствует формату',
        HttpStatus.BAD_REQUEST,
      );
    }
    const regex = /(?=.*[A-Z])(?=.*[0-9])/;
    if (!regex.test(createUserDto.password)) {
      throw new HttpException(
        'Пароль должен содержать не менее 1 цифры и 1 одной заглавной буквы',
        HttpStatus.BAD_REQUEST,
      );
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(createUserDto.password, salt);
    return await this.userRepository.create(user);
  }
  async updateUserById(id: number, UpdateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    return await user.update(UpdateUserDto);
  }
  async authLogin(authLoginDto: AuthLoginDto): Promise<CreateUserDto> {
    const user = await this.userRepository.findOne({
      where: { account: authLoginDto.account },
    });
    if (user === null) {
      throw new HttpException(
        'Пользователь не найден!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const auth = await bcrypt.compare(authLoginDto.password, user.password);
    if (!auth) {
      throw new HttpException('Неверный пароль!', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}
