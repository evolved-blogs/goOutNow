import { Controller, Get, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatService, GLOBAL_CHAT_EVENT } from '../services/chat.service';
import { GlobalMessageDto, SendGlobalMessageDto } from '../dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** GET /api/chat — last 50 messages */
  @Get()
  async getRecent(): Promise<GlobalMessageDto[]> {
    return this.chatService.getRecent();
  }

  /** POST /api/chat — send a message */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async send(@Body() dto: SendGlobalMessageDto): Promise<GlobalMessageDto> {
    return this.chatService.send(dto);
  }

  /**
   * GET /api/chat/stream — SSE endpoint.
   * Must be declared before any param-based routes.
   */
  @Get('stream')
  stream(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 20_000);

    const listener = (msg: GlobalMessageDto) => {
      res.write(`data: ${JSON.stringify(msg)}\n\n`);
    };

    this.eventEmitter.on(GLOBAL_CHAT_EVENT, listener);

    res.on('close', () => {
      clearInterval(heartbeat);
      this.eventEmitter.off(GLOBAL_CHAT_EVENT, listener);
    });
  }
}
