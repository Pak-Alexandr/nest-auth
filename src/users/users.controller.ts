import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { GetAllUsersDto } from './dto/get-all-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('getAllUsers')
  @HttpCode(HttpStatus.OK)
  getAllUsers(@Query() queryParams: GetAllUsersDto): Promise<CreateUserDto[]> {
    return this.usersService.getAllUsers(queryParams);
  }
  @Get('/getUserById/:id')
  @HttpCode(HttpStatus.OK)
  getUserById(@Param('id') userId): Promise<CreateUserDto> {
    return this.usersService.getUserById(userId);
  }
  @Post('createNewUser')
  @UsePipes(new ValidationPipe())
  createNewUser(@Body() body: CreateUserDto): Promise<CreateUserDto | Error> {
    return this.usersService.createNewUser(body);
  }
  @Patch('/updateUserById/:id')
  @HttpCode(HttpStatus.OK)
  updateUserById(
    @Param('id') id,
    @Body() body: UpdateUserDto,
  ): Promise<UpdateUserDto> {
    return this.usersService.updateUserById(id, body);
  }
  @Post('authLogin')
  @HttpCode(HttpStatus.OK)
  authLogin(@Body() body: AuthLoginDto): Promise<CreateUserDto | string> {
    return this.usersService.authLogin(body);
  }
}
