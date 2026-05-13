import { Controller, Get,Post,Query, Req, UseGuards,Body, Param, Delete } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

    @Get('/')
    async getReviewsById(@Req() req,@Query() param: { skip: number; limit: number }) {
        return this.reviewService.getAllReviews(req.user.id, param);
    }

    @Post('/:id/like')
    async addLike(@Req() req, @Param('id') id: number, @Body() body: { tipo: string }) {
        return this.reviewService.addLike(req.user.id, id, body.tipo);
    }

    @Delete('/:id/like')
    async removeLike(@Req() req, @Param('id') id: number, @Body() body: { tipo: string }) {
        return this.reviewService.removeLike(req.user.id, id, body.tipo);
    }
}
