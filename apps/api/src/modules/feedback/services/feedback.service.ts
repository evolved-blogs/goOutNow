import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { CreateFeedbackDto, FeedbackResponseDto, FeedbackSummaryDto, PendingFeedbackDto } from '../dto/feedback.dto';
import { PostRepository } from '../../post/repositories/post.repository';

interface FeedbackRecord {
  id: string;
  postId: string;
  fromUserId: string;
  activityRating: number;
  organizerRating: number;
  comment: string | null;
  createdAt: Date;
}

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly postRepository: PostRepository,
  ) {}

  /**
   * Submit feedback for an activity.
   * Only members (joinee) of the post can submit; one feedback per user.
   */
  async createFeedback(postId: string, dto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    // Verify post exists
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Activity not found');

    // Only joinee (members) may submit feedback — not the creator
    const members = await this.postRepository.getMembers(postId);
    const isMember = members.some((m) => m.userId === dto.fromUserId);
    if (!isMember) {
      throw new ForbiddenException('Only joined members can submit feedback');
    }

    // Prevent duplicate submissions
    const existing = await this.feedbackRepository.findByPostAndUser(postId, dto.fromUserId);
    if (existing) {
      throw new ConflictException('You have already submitted feedback for this activity');
    }

    const feedback = await this.feedbackRepository.create(postId, dto);
    return this.mapToDto(feedback);
  }

  /**
   * Get all feedbacks for a post with computed averages.
   */
  async getFeedbackSummary(postId: string): Promise<FeedbackSummaryDto> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Activity not found');

    const feedbacks = await this.feedbackRepository.findByPost(postId);
    const total = feedbacks.length;

    const avgActivityRating =
      total > 0
        ? Math.round(
            (feedbacks.reduce((sum: number, f: FeedbackRecord) => sum + f.activityRating, 0) /
              total) *
              10,
          ) / 10
        : 0;

    const avgOrganizerRating =
      total > 0
        ? Math.round(
            (feedbacks.reduce((sum: number, f: FeedbackRecord) => sum + f.organizerRating, 0) /
              total) *
              10,
          ) / 10
        : 0;

    return {
      totalFeedbacks: total,
      avgActivityRating,
      avgOrganizerRating,
      feedbacks: feedbacks.map((f: FeedbackRecord) => this.mapToDto(f)),
    };
  }

  /**
   * Check whether a specific user has already submitted feedback.
   */
  async hasUserSubmitted(postId: string, userId: string): Promise<{ submitted: boolean }> {
    const existing = await this.feedbackRepository.findByPostAndUser(postId, userId);
    return { submitted: !!existing };
  }

  /**
   * Returns all completed activities the user joined but hasn't rated yet.
   * Called on app launch to show the pending-feedback prompt.
   */
  async getPendingFeedback(userId: string): Promise<PendingFeedbackDto[]> {
    const posts = await this.feedbackRepository.findPendingFeedbackPosts(userId);
    return posts.map((p) => {
      const count = (p as any)._count?.members ?? 0;
      return {
        postId: p.id,
        title: p.title,
        activityType: p.activityType,
        scheduledTime: p.scheduledTime,
        createdById: p.createdById,
        memberCount: count,
      };
    });
  }

  private mapToDto(f: FeedbackRecord): FeedbackResponseDto {
    return {
      id: f.id,
      postId: f.postId,
      fromUserId: f.fromUserId,
      activityRating: f.activityRating,
      organizerRating: f.organizerRating,
      comment: f.comment,
      createdAt: f.createdAt,
    };
  }
}
