import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async loginOrRegister(phoneNumber: string) {
    let user = await this.prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      user = await this.prisma.user.create({ data: { phoneNumber } });
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      isNew: false, // kept for reference but not used for routing
    };
  }
}
