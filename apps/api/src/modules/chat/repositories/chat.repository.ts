import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { GlobalMessage } from '@prisma/client';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getRecent(limit = 50): Promise<GlobalMessage[]> {
    return this.prisma.globalMessage.findMany({
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async add(userId: string, text: string): Promise<GlobalMessage> {
    return this.prisma.globalMessage.create({ data: { userId, text } });
  }
}
