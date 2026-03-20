import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FeedbackService } from '../services/feedback.service';
import {
  CreateFeedbackDto,
  FeedbackResponseDto,
  FeedbackSummaryDto,
  PendingFeedbackDto,
} from '../dto/feedback.dto';

@Controller('posts/:postId/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * POST /api/posts/:postId/feedback
   * Submit feedback for an activity (only joinee members)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submit(
    @Param('postId') postId: string,
    @Body() dto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.createFeedback(postId, dto);
  }

  /**
   * GET /api/posts/:postId/feedback
   * Get all feedbacks + avg ratings for an activity
   */
  @Get()
  async getSummary(@Param('postId') postId: string): Promise<FeedbackSummaryDto> {
    return this.feedbackService.getFeedbackSummary(postId);
  }

  /**
   * GET /api/posts/:postId/feedback/check?userId=xxx
   * Check if a user has already submitted feedback
   */
  @Get('check')
  async check(
    @Param('postId') postId: string,
    @Query('userId') userId: string,
  ): Promise<{ submitted: boolean }> {
    return this.feedbackService.hasUserSubmitted(postId, userId);
  }
}

@Controller('feedback')
export class FeedbackPendingController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * GET /api/feedback/pending?userId=xxx
   * Returns activities the user has not yet rated
   */
  @Get('pending')
  async getPending(@Query('userId') userId: string): Promise<PendingFeedbackDto[]> {
    return this.feedbackService.getPendingFeedback(userId);
  }
}
