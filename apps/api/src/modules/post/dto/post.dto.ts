/**
 * Post DTOs (Data Transfer Objects)
 * These classes define the shape of data for API requests and responses
 * Using class-validator decorators for automatic validation
 */

import { IsString, IsNotEmpty, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new post
 * Validates all required fields for post creation
 */
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  activityType: string;

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

  @IsString()
  @IsNotEmpty()
  createdById: string;
}

/**
 * DTO for fetching nearby posts
 * Requires user's current location
 */
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

/**
 * DTO for joining a post
 */
export class JoinPostDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

/**
 * Response DTO for post with distance information
 * Used when returning nearby posts
 */
export class PostWithDistanceDto {
  id: string;
  title: string;
  activityType: string;
  latitude: number;
  longitude: number;
  scheduledTime: Date;
  createdById: string;
  distance: number; // Distance in kilometers
  memberCount: number;
  createdAt: Date;
}

/**
 * DTO for a single post member
 */
export class PostMemberDto {
  userId: string;
  joinedAt: Date;
}

/**
 * DTO for a chat message on a post
 */
export class MessageDto {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

/**
 * DTO for sending a message
 */
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

/**
 * Standard post response DTO
 */
export class PostResponseDto {
  id: string;
  title: string;
  activityType: string;
  latitude: number;
  longitude: number;
  scheduledTime: Date;
  createdById: string;
  memberCount: number;
  createdAt: Date;
}
