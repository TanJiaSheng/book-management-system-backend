import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DbService } from 'src/db/db.service';
import { LoginUserDto } from './dto/login-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  @Inject(DbService)
  dbService: DbService;
  async create(createUserDto: CreateUserDto) {
    const users: User[] = await this.dbService.read();
    const foundUser = users.find(
      (item: CreateUserDto) => item.username === createUserDto.username,
    );
    if (foundUser) throw new BadRequestException('该用户已经注册');
    const user = new User();
    user.id = uuidv4();
    user.username = createUserDto.username;
    user.password = createUserDto.password;
    users.push(user);
    await this.dbService.write(users);
    return user;
  }

  async findAll() {
    const users: User[] = await this.dbService.read();
    return users;
  }

  async findOne(id: string) {
    const users: User[] = await this.dbService.read();
    const foundUser = users.find((item: UserDto) => item.id === id);
    if (!foundUser) {
      throw new BadRequestException('用户不存在');
    }
    return foundUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const users: User[] = await this.dbService.read();
    const foundUser = users.find((item: UpdateUserDto) => item.id === id);
    if (foundUser) {
      throw new BadRequestException('用户不存在');
    }
    const otherUser = users.find(
      (item: UpdateUserDto) =>
        item.id !== id && item.username === updateUserDto.username,
    );
    if (otherUser) {
      throw new BadRequestException('用户不能重复');
    }

    foundUser.username = updateUserDto.username;
    foundUser.password = updateUserDto.password;
    await this.dbService.write(users);
    return foundUser;
  }

  async remove(id: string) {
    const users: User[] = await this.dbService.read();
    const foundIndex = users.findIndex((item: UserDto) => item.id === id);
    if (foundIndex < 0) {
      throw new BadRequestException('用户不存在');
    }
    users.splice(foundIndex, 1);
    await this.dbService.write(users);
    return true;
  }

  async login(loginUserDto: LoginUserDto) {
    const users: User[] = await this.dbService.read();
    const foundUser = users.find(
      (item: LoginUserDto) => item.username === loginUserDto.username,
    );
    if (!foundUser) {
      throw new BadRequestException('用户不存在');
    }
    if (foundUser.password !== loginUserDto.password) {
      throw new BadRequestException('密码不正确');
    }
    return foundUser;
  }
}
