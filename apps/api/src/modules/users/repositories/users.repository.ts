import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
  createdAt: Date;
}

export interface UserStats {
  eventsHosted: number;
  activitiesJoined: number;
  peopleMet: number;
  rating: number;
  ratingCount: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  activityType: string;
  scheduledTime: Date;
  memberCount: number;
  isHost: boolean;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  interests?: string[];
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateProfileData): Promise<UserProfile> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getStats(userId: string): Promise<UserStats> {
    const [eventsHosted, activitiesJoined, feedbackAgg, hostedMembers] =
      await this.prisma.$transaction([
        // Count posts created by user
        this.prisma.post.count({ where: { createdById: userId } }),
        // Count posts user has joined (excluding ones they created)
        this.prisma.postMember.count({ where: { userId } }),
        // Average organizer rating from feedback on hosted posts
        this.prisma.feedback.aggregate({
          _avg: { organizerRating: true },
          _count: { organizerRating: true },
          where: { post: { createdById: userId } },
        }),
        // Total members across hosted posts = people met
        this.prisma.postMember.count({
          where: { post: { createdById: userId }, NOT: { userId } },
        }),
      ]);

    return {
      eventsHosted,
      activitiesJoined,
      peopleMet: hostedMembers,
      rating: feedbackAgg._avg.organizerRating
        ? Math.round(feedbackAgg._avg.organizerRating * 10) / 10
        : 0,
      ratingCount: feedbackAgg._count.organizerRating,
    };
  }

  async getRecentActivity(userId: string, limit = 10): Promise<RecentActivity[]> {
    const [hostedPosts, joinedMembers] = await Promise.all([
      this.prisma.post.findMany({
        where: { createdById: userId },
        include: { _count: { select: { members: true } } },
        orderBy: { scheduledTime: 'desc' },
        take: limit,
      }),
      this.prisma.postMember.findMany({
        where: { userId },
        include: {
          post: { include: { _count: { select: { members: true } } } },
        },
        orderBy: { joinedAt: 'desc' },
        take: limit,
      }),
    ]);

    const hosted: RecentActivity[] = hostedPosts.map((p) => ({
      id: p.id,
      title: p.title,
      activityType: p.activityType,
      scheduledTime: p.scheduledTime,
      memberCount: p._count.members,
      isHost: true,
    }));

    const joined: RecentActivity[] = joinedMembers
      // Exclude posts the user also created (already in hosted)
      .filter((m) => m.post.createdById !== userId)
      .map((m) => ({
        id: m.post.id,
        title: m.post.title,
        activityType: m.post.activityType,
        scheduledTime: m.post.scheduledTime,
        memberCount: m.post._count.members,
        isHost: false,
      }));

    return [...hosted, ...joined]
      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
      .slice(0, limit);
  }
}
