/**
 * Prisma Service
 * Manages database connection lifecycle and provides Prisma Client instance
 * Implements NestJS lifecycle hooks for proper connection management
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Initializes database connection when the module is initialized
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log('✅ Database connected');
  }

  /**
   * Gracefully closes database connection when the application shuts down
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }
}
