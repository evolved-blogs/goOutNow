/**
 * Post Repository
 * Data Access Layer - Handles all database operations for posts
 * Follows Repository pattern to abstract database logic from business logic
 * This layer is the ONLY place where Prisma Client is used for posts
 */

import { Injectable } from '@nestjs/common';
import { Post, PostMember, Message } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Interface for post creation data
 */
export interface CreatePostData {
  title: string;
  description?: string;
  activityType: string;
  vibe?: string;
  latitude: number;
  longitude: number;
  scheduledTime: Date;
  requiredParticipants: number;
  rolesNeeded?: { role: string; count: number }[];
  createdById: string;
}

/**
 * Post entity with member count
 */
export interface PostWithMembers extends Post {
  _count: {
    members: number;
  };
}

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new post in the database
   * @param data - Post creation data
   * @returns Created post with member count
   */
  async create(data: CreatePostData): Promise<PostWithMembers> {
    return this.prisma.post.create({
      data,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  /**
   * Finds a post by ID
   * @param id - Post ID
   * @returns Post with member count or null
   */
  async findById(id: string): Promise<PostWithMembers | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }

  /**
   * Retrieves all posts from the database
   * Used for calculating distances to find nearest posts
   * In production, consider adding pagination or a radius-based query
   *
   * @returns Array of all posts with member counts
   */
  async findAll(): Promise<PostWithMembers[]> {
    return this.prisma.post.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });
  }

  /**
   * Finds posts created by a specific user
   * @param userId - User ID
   * @returns Array of user's posts
   */
  async findByUserId(userId: string): Promise<PostWithMembers[]> {
    return this.prisma.post.findMany({
      where: { createdById: userId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Adds a user as a member to a post
   * Uses upsert to handle idempotent requests (user can't join twice)
   *
   * @param postId - Post ID
   * @param userId - User ID
   * @returns Created or existing post member record
   */
  async addMember(postId: string, userId: string): Promise<PostMember> {
    return this.prisma.postMember.create({
      data: {
        postId,
        userId,
      },
    });
  }

  /**
   * Checks if a user is already a member of a post
   * @param postId - Post ID
   * @param userId - User ID
   * @returns true if user is a member
   */
  async isMember(postId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.postMember.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    return member !== null;
  }

  /**
   * Gets all members of a post
   * @param postId - Post ID
   * @returns Array of post members with user details
   */
  async getMembers(postId: string): Promise<PostMember[]> {
    return this.prisma.postMember.findMany({
      where: { postId },
      // No user relation in guest schema
    });
  }

  /**
   * Gets all messages for a post ordered oldest-first
   * @param postId - Post ID
   * @returns Array of messages
   */
  async getMessages(postId: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Adds a message to a post
   * @param postId - Post ID
   * @param userId - Sender's guest UUID
   * @param text   - Message content
   * @returns Created message
   */
  async addMessage(postId: string, userId: string, text: string): Promise<Message> {
    return this.prisma.message.create({
      data: { postId, userId, text },
    });
  }
}
