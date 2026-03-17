/**
 * Post Controller
 * Presentation Layer - Handles HTTP requests and responses
 * NO business logic here - delegates to Service layer
 * Responsible only for request/response transformation and routing
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostService } from '../services/post.service';
import {
  CreatePostDto,
  GetNearbyPostsDto,
  JoinPostDto,
  PostWithDistanceDto,
  PostResponseDto,
  PostMemberDto,
  MessageDto,
  SendMessageDto,
} from '../dto/post.dto';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * POST /api/posts
   * Creates a new post
   *
   * @param createPostDto - Post creation data from request body
   * @returns Created post
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() createPostDto: CreatePostDto): Promise<PostResponseDto> {
    return this.postService.createPost(createPostDto);
  }

  /**
   * GET /api/posts/nearby
   * Gets nearby posts based on user's location
   * Returns up to 5 nearest posts
   *
   * Query params: latitude, longitude
   *
   * @param query - User's coordinates
   * @returns Array of nearby posts with distances
   */
  @Get('nearby')
  async getNearbyPosts(@Query() query: GetNearbyPostsDto): Promise<PostWithDistanceDto[]> {
    return this.postService.getNearbyPosts({
      latitude: query.latitude,
      longitude: query.longitude,
    });
  }

  /**
   * GET /api/posts/:id/members
   * MUST be declared before GET :id so NestJS matches the literal
   * segment 'members' before the wildcard :id param.
   */
  @Get(':id/members')
  async getPostMembers(@Param('id') id: string): Promise<PostMemberDto[]> {
    return this.postService.getPostMembers(id);
  }

  /**
   * GET /api/posts/:id/messages
   * Returns all chat messages for a post (oldest first).
   * Also declared before :id for the same routing reason.
   */
  @Get(':id/messages')
  async getMessages(@Param('id') id: string): Promise<MessageDto[]> {
    return this.postService.getMessages(id);
  }

  /**
   * POST /api/posts/:id/messages
   * Sends a message into the post chat.
   */
  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto): Promise<MessageDto> {
    return this.postService.sendMessage(id, dto);
  }

  /**
   * GET /api/posts/:id/messages/stream
   * SSE endpoint — keeps connection open and pushes new messages instantly.
   * Must be declared before GET :id to avoid route shadowing.
   */
  @Get(':id/messages/stream')
  streamMessages(@Param('id') id: string, @Res() res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Send a heartbeat comment every 20s to keep the connection alive
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 20_000);

    const listener = (message: MessageDto) => {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    };

    this.eventEmitter.on(`messages.${id}`, listener);

    res.on('close', () => {
      clearInterval(heartbeat);
      this.eventEmitter.off(`messages.${id}`, listener);
    });
  }

  /**
   * GET /api/posts/:id
   * Gets a single post by ID
   */
  @Get(':id')
  async getPost(@Param('id') id: string): Promise<PostResponseDto> {
    return this.postService.getPostById(id);
  }

  /**
   * POST /api/posts/:id/join
   * Allows a user to join a post
   *
   * @param id - Post ID from URL parameter
   * @param joinPostDto - User ID from request body
   * @returns Updated post with new member count
   */
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinPost(
    @Param('id') id: string,
    @Body() joinPostDto: JoinPostDto,
  ): Promise<PostResponseDto> {
    return this.postService.joinPost(id, joinPostDto.userId);
  }

  /**
   * GET /api/posts/user/:userId
   * Gets all posts created by a specific user
   *
   * @param userId - User ID from URL parameter
   * @returns Array of user's posts
   */
  @Get('user/:userId')
  async getUserPosts(@Param('userId') userId: string): Promise<PostResponseDto[]> {
    return this.postService.getPostsByUser(userId);
  }
}
