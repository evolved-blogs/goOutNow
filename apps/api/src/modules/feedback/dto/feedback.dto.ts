import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  activityRating: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  organizerRating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class FeedbackResponseDto {
  id: string;
  postId: string;
  fromUserId: string;
  activityRating: number;
  organizerRating: number;
  comment: string | null;
  createdAt: Date;
}

export class FeedbackSummaryDto {
  totalFeedbacks: number;
  avgActivityRating: number;
  avgOrganizerRating: number;
  feedbacks: FeedbackResponseDto[];
}

export class PendingFeedbackDto {
  postId: string;
  title: string;
  activityType: string;
  scheduledTime: Date;
  createdById: string;
  memberCount: number;
}
