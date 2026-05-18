import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateGoogleUserData } from 'src/types/createGoogleUserData.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }
  findByGoogleId(googleId: string) {
    return this.usersRepository.findOne({
      where: { googleId },
    });
  }
  async findOrCreateGoogleUser(data: CreateGoogleUserData) {
    const userByGoogleId = await this.findByGoogleId(data.googleId);
    if (userByGoogleId) {
      return userByGoogleId;
    }
    const userByEmail = await this.findByEmail(data.email);
    if (userByEmail) {
      userByEmail.googleId = data.googleId;
      userByEmail.name = userByEmail.name ?? data.name;
      userByEmail.avatar = userByEmail.avatar ?? data.avatar;

      return this.usersRepository.save(userByEmail);
    }
    const user = this.usersRepository.create({
      googleId: data.googleId,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
    });
    return this.usersRepository.save(user);
  }
}
