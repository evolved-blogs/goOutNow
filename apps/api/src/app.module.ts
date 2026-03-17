/**
 * Root Application Module
 * Orchestrates all feature modules and global configuration
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PostModule } from './modules/post/post.module';
import { ChatModule } from './modules/chat/chat.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Global event emitter (for SSE message broadcasting)
    EventEmitterModule.forRoot(),

    // Infrastructure
    DatabaseModule,

    // Feature modules
    PostModule,
    ChatModule,
  ],
})
export class AppModule {}
