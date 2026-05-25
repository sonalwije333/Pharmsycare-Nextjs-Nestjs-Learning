// reviews/reviews.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import reviewJSON from '@db/reviews.json';

@Injectable()
export class ReviewService {
  private reviews: Review[] = plainToClass(Review, reviewJSON);

  async findAllReviews({
    search,
    limit = 30,
    page = 1,
    product_id,
    rating,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetReviewsDto): Promise<ReviewPaginator> {
    let data: Review[] = [...this.reviews];

    // Apply filters
    if (product_id) {
      data = data.filter(review => review.product_id === Number(product_id));
    }

    if (rating) {
      data = data.filter(review => review.rating === rating);
    }

    if (search) {
      const fuse = new Fuse(data, {
        keys: ['comment'],
        threshold: 0.3,
      });
      data = fuse.search(search)?.map(({ item }) => item);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (orderBy === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/reviews?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findReview(id: number): Promise<Review> {
    const review = this.reviews.find(r => r.id === id);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    
    return review;
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const newReview: Review = {
      id: this.reviews.length + 1,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      photos: createReviewDto.photos || [],
      product_id: createReviewDto.product_id,
      user_id: 1, // This should come from authenticated user
      positive_feedbacks_count: 0,
      negative_feedbacks_count: 0,
      abusive_reports_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    } as Review;

    this.reviews.push(newReview);
    return newReview;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const reviewIndex = this.reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) {
      throw new NotFoundException('Review not found');
    }

    const updatedReview = {
      ...this.reviews[reviewIndex],
      ...updateReviewDto,
      updated_at: new Date()
    };

    this.reviews[reviewIndex] = updatedReview as Review;
    return updatedReview as Review;
  }

  async delete(id: number): Promise<CoreMutationOutput> {
    const reviewIndex = this.reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) {
      throw new NotFoundException('Review not found');
    }

    this.reviews.splice(reviewIndex, 1);
    
    return {
      success: true,
      message: 'Review deleted successfully'
    };
  }
}