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
    if (user.individualIdentificationNumber.length !== 12) {
      throw new HttpException(
        'Длина ИИН не может быть не 12 символов',
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
    const hash = await bcrypt.hash(createUserDto.password, salt);
    user.password = hash;
    const createdUser = await this.userRepository.create(user);
    return createdUser;
  }
  async updateUserById(id: number, UpdateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    const updateRows = await user.update(UpdateUserDto);
    return updateRows;
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
