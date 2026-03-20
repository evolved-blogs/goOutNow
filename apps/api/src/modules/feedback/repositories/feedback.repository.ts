import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateFeedbackDto } from '../dto/feedback.dto';

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: string, dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        postId,
        fromUserId: dto.fromUserId,
        activityRating: dto.activityRating,
        organizerRating: dto.organizerRating,
        comment: dto.comment ?? null,
      },
    });
  }

  async findByPost(postId: string) {
    return this.prisma.feedback.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPostAndUser(postId: string, userId: string) {
    return this.prisma.feedback.findUnique({
      where: { postId_fromUserId: { postId, fromUserId: userId } },
    });
  }

  /**
   * Returns posts the user joined that have already ended
   * and for which the user has NOT yet submitted feedback.
   * Excludes posts the user created (organizer shouldn't rate their own).
   */
  async findPendingFeedbackPosts(userId: string) {
    const now = new Date();

    // Posts the user is a member of (joined), ended, and has no feedback from them
    const memberships = await this.prisma.postMember.findMany({
      where: { userId },
      select: { postId: true },
    });
    const joinedPostIds = memberships.map((m) => m.postId);

    if (joinedPostIds.length === 0) return [];

    // Get posts that: are in the joined list, scheduled time has passed,
    // user is not the creator, no feedback row exists from this user,
    // AND the activity actually ran (member count >= requiredParticipants).
    const pending = await this.prisma.post.findMany({
      where: {
        id: { in: joinedPostIds },
        scheduledTime: { lt: now },
        createdById: { not: userId },
        feedbacks: {
          none: { fromUserId: userId },
        },
        // Only activities that reached the required player count (game ran)
        members: {
          some: { userId }, // sanity: user is still a member
        },
      },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { scheduledTime: 'desc' },
    });

    // Post-filter: actual member count must meet requiredParticipants
    return pending.filter((p) => p._count.members >= ((p as any).requiredParticipants ?? 2));
  }
}
