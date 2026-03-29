import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository, UpdateProfileData } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const stats = await this.usersRepository.getStats(id);
    const displayName = user.displayName ?? `Player-${id.slice(-4).toUpperCase()}`;
    const username = displayName.toLowerCase().replace(/\s+/g, '_');
    return { ...user, displayName, username, stats };
  }

  async updateProfile(id: string, data: UpdateProfileData) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.usersRepository.update(id, data);
    const stats = await this.usersRepository.getStats(id);
    const displayName = updated.displayName ?? `Player-${id.slice(-4).toUpperCase()}`;
    const username = displayName.toLowerCase().replace(/\s+/g, '_');
    return { ...updated, displayName, username, stats };
  }

  async getRecentActivity(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return this.usersRepository.getRecentActivity(id);
  }
}
