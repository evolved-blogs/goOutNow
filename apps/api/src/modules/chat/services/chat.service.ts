import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatRepository } from '../repositories/chat.repository';
import { GlobalMessageDto, SendGlobalMessageDto } from '../dto/chat.dto';

export const GLOBAL_CHAT_EVENT = 'global.message';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getRecent(): Promise<GlobalMessageDto[]> {
    const msgs = await this.chatRepository.getRecent(50);
    return msgs.map((m) => ({
      id: m.id,
      userId: m.userId,
      text: m.text,
      createdAt: m.createdAt,
    }));
  }

  async send(dto: SendGlobalMessageDto): Promise<GlobalMessageDto> {
    const m = await this.chatRepository.add(dto.userId, dto.text);
    const out: GlobalMessageDto = {
      id: m.id,
      userId: m.userId,
      text: m.text,
      createdAt: m.createdAt,
    };
    this.eventEmitter.emit(GLOBAL_CHAT_EVENT, out);
    return out;
  }
}
