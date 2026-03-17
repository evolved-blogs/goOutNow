/**
 * Post Service
 * Business Logic Layer - Contains all post-related business rules
 * Orchestrates between Repository (data) and Controller (presentation)
 * NO direct database access - uses Repository instead
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostRepository, PostWithMembers } from '../repositories/post.repository';
import {
  CreatePostDto,
  PostWithDistanceDto,
  PostResponseDto,
  PostMemberDto,
  MessageDto,
  SendMessageDto,
} from '../dto/post.dto';
import { findNearestEntities, Coordinates } from '@gooutnow/shared';

@Injectable()
export class PostService {
  // Maximum number of nearby users who can see a post
  private readonly MAX_NEARBY_USERS = 5;

  constructor(
    private readonly postRepository: PostRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new post
   * Business rule: All coordinates must be valid
   *
   * @param createPostDto - Post creation data
   * @returns Created post response
   */
  async createPost(createPostDto: CreatePostDto): Promise<PostResponseDto> {
    // Convert DTO to repository format
    const postData = {
      title: createPostDto.title,
      activityType: createPostDto.activityType,
      latitude: createPostDto.latitude,
      longitude: createPostDto.longitude,
      scheduledTime: new Date(createPostDto.scheduledTime),
      createdById: createPostDto.createdById,
    };

    const post = await this.postRepository.create(postData);

    // Auto-add the creator as the first member so they appear in the
    // "Who joined" list and memberCount starts at 1.
    await this.postRepository.addMember(post.id, createPostDto.createdById);

    // Re-fetch so the returned memberCount reflects the auto-join.
    const updatedPost = await this.postRepository.findById(post.id);
    return this.mapToResponseDto(updatedPost!);
  }

  /**
   * Gets nearby posts for a user based on their location
   * Business rule: Only show 5 nearest posts
   *
   * Algorithm:
   * 1. Fetch all posts from database
   * 2. Calculate distance from user to each post using Haversine formula
   * 3. Sort by distance and limit to 5 nearest
   *
   * @param userLocation - User's current coordinates
   * @returns Array of nearby posts with distances
   */
  async getNearbyPosts(userLocation: Coordinates): Promise<PostWithDistanceDto[]> {
    // Fetch all posts (in production, optimize with spatial queries)
    const allPosts = await this.postRepository.findAll();

    // Calculate distances and find nearest posts
    const nearestPosts = findNearestEntities(userLocation, allPosts, this.MAX_NEARBY_USERS);

    // Map to response DTOs with distance information
    return nearestPosts.map((result: { entity: PostWithMembers; distance: number }) => ({
      id: result.entity.id,
      title: result.entity.title,
      activityType: result.entity.activityType,
      latitude: result.entity.latitude,
      longitude: result.entity.longitude,
      scheduledTime: result.entity.scheduledTime,
      createdById: result.entity.createdById,
      distance: Math.round(result.distance * 100) / 100, // Round to 2 decimal places
      memberCount: result.entity._count.members,
      createdAt: result.entity.createdAt,
    }));
  }

  /**
   * Allows a user to join a post
   * Business rules:
   * - Post must exist
   * - User cannot join the same post twice
   *
   * @param postId - Post ID
   * @param userId - User ID
   * @returns Updated post response
   */
  async joinPost(postId: string, userId: string): Promise<PostResponseDto> {
    // Verify post exists
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user already joined
    const isAlreadyMember = await this.postRepository.isMember(postId, userId);
    if (isAlreadyMember) {
      throw new BadRequestException('User has already joined this post');
    }

    // Add user as member
    await this.postRepository.addMember(postId, userId);

    // Return updated post
    const updatedPost = await this.postRepository.findById(postId);
    return this.mapToResponseDto(updatedPost!);
  }

  /**
   * Gets a single post by ID
   * @param id - Post ID
   * @returns Post response
   */
  async getPostById(id: string): Promise<PostResponseDto> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return this.mapToResponseDto(post);
  }

  /**
   * Gets all posts created by a user
   * @param userId - User ID
   * @returns Array of user's posts
   */
  async getPostsByUser(userId: string): Promise<PostResponseDto[]> {
    const posts = await this.postRepository.findByUserId(userId);
    return posts.map((post) => this.mapToResponseDto(post));
  }

  /**
   * Gets all members of a post (only useful to the creator)
   * @param postId - Post ID
   * @returns Array of member DTOs
   */
  async getPostMembers(postId: string): Promise<PostMemberDto[]> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    const members = await this.postRepository.getMembers(postId);
    return members.map((m) => ({ userId: m.userId, joinedAt: m.joinedAt }));
  }

  /**
   * Gets all messages for a post
   */
  async getMessages(postId: string): Promise<MessageDto[]> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);
    const messages = await this.postRepository.getMessages(postId);
    return messages.map((m) => ({
      id: m.id,
      postId: m.postId,
      userId: m.userId,
      text: m.text,
      createdAt: m.createdAt,
    }));
  }

  /**
   * Sends a message to a post's chat
   */
  async sendMessage(postId: string, dto: SendMessageDto): Promise<MessageDto> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);
    const message = await this.postRepository.addMessage(postId, dto.userId, dto.text);
    const dto_out: MessageDto = {
      id: message.id,
      postId: message.postId,
      userId: message.userId,
      text: message.text,
      createdAt: message.createdAt,
    };
    // Broadcast to all SSE subscribers for this post
    this.eventEmitter.emit(`messages.${postId}`, dto_out);
    return dto_out;
  }

  /**
   * Maps database entity to response DTO
   * Separates internal representation from API response
   *
   * @param post - Post entity from database
   * @returns Post response DTO
   */
  private mapToResponseDto(post: PostWithMembers): PostResponseDto {
    return {
      id: post.id,
      title: post.title,
      activityType: post.activityType,
      latitude: post.latitude,
      longitude: post.longitude,
      scheduledTime: post.scheduledTime,
      createdById: post.createdById,
      memberCount: post._count.members,
      createdAt: post.createdAt,
    };
  }
}
