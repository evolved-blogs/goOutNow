import { Module } from '@nestjs/common';
import { FeedbackController, FeedbackPendingController } from './controllers/feedback.controller';
import { FeedbackService } from './services/feedback.service';
import { FeedbackRepository } from './repositories/feedback.repository';
import { PostRepository } from '../post/repositories/post.repository';

@Module({
  controllers: [FeedbackController, FeedbackPendingController],
  providers: [FeedbackService, FeedbackRepository, PostRepository],
})
export class FeedbackModule {}
