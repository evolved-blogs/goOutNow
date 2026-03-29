import { IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone number must be in E.164 format (e.g. +919876543210)',
  })
  phoneNumber: string;
}
