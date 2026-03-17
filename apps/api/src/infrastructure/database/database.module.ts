/**
 * Database Module
 * Provides Prisma Client as a global service for database access
 * Following the Repository pattern for clean architecture
 */

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
