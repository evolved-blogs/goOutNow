import { IsString, IsNotEmpty } from 'class-validator';

export class GlobalMessageDto {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export class SendGlobalMessageDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
