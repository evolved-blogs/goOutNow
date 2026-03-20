/**
 * Post DTOs (Data Transfer Objects)
 * These classes define the shape of data for API requests and responses
 * Using class-validator decorators for automatic validation
 */

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** A single role entry e.g. { role: "Guitarist", count: 2 } */
export class RoleNeededDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsInt()
  @Min(1)
  count: number;
}

/** DTO for creating a new post */
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  activityType: string;

  @IsOptional()
  @IsString()
  vibe?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsDateString()
  scheduledTime: string;

  @IsInt()
  @Min(1)
  @Max(100)
  requiredParticipants: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleNeededDto)
  rolesNeeded?: RoleNeededDto[];

  @IsString()
  @IsNotEmpty()
  createdById: string;
}

/** DTO for fetching nearby posts — requires user location */
export class GetNearbyPostsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

/** DTO for joining a post */
export class JoinPostDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

/** Response DTO for nearby posts (includes distance) */
export class PostWithDistanceDto {
  id: string;
  title: string;
  description?: string;
  activityType: string;
  vibe?: string;
  latitude: number;
  longitude: number;
  scheduledTime: Date;
  requiredParticipants: number;
  rolesNeeded?: RoleNeededDto[];
  createdById: string;
  distance: number;
  memberCount: number;
  createdAt: Date;
}

/** DTO for a single post member */
export class PostMemberDto {
  userId: string;
  joinedAt: Date;
}

/** DTO for a chat message */
export class MessageDto {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

/** DTO for sending a message */
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

/** Standard post response DTO */
export class PostResponseDto {
  id: string;
  title: string;
  description?: string;
  activityType: string;
  vibe?: string;
  latitude: number;
  longitude: number;
  scheduledTime: Date;
  requiredParticipants: number;
  rolesNeeded?: RoleNeededDto[];
  createdById: string;
  memberCount: number;
  createdAt: Date;
}
