// become-seller/become-seller.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { BecomeSeller } from './entities/become-seller.entity';
import { CreateBecomeSellerDto } from './dto/create-become-seller.dto';
import { UpdateBecomeSellerDto } from './dto/update-become-seller.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import becomeSellerJson from '@db/become-seller.json';

@Injectable()
export class BecomeSellerService {
  constructor(
    @InjectRepository(BecomeSeller)
    private becomeSellerRepository: Repository<BecomeSeller>,
  ) {}

  private normalizePageOptions(
    pageOptions: CreateBecomeSellerDto['page_options'] | UpdateBecomeSellerDto['page_options'],
  ): { page_options: Record<string, any> } {
    const value = pageOptions as any;
    if (value && typeof value === 'object' && value.page_options) {
      return { page_options: value.page_options };
    }

    return { page_options: value as Record<string, any> };
  }

  async create(
    createBecomeSellerDto: CreateBecomeSellerDto,
  ): Promise<BecomeSeller> {
    const language = createBecomeSellerDto.language || 'en';
    const normalizedPageOptions = this.normalizePageOptions(
      createBecomeSellerDto.page_options,
    );

    // Upsert by language because the admin save flow posts to this endpoint for edits.
    const existing = await this.becomeSellerRepository.findOne({
      where: { language },
    });

    if (existing) {
      existing.page_options = normalizedPageOptions as any;
      existing.commissions = createBecomeSellerDto.commissions as any;
      existing.language = language;
      return this.becomeSellerRepository.save(existing);
    }

    const becomeSeller = this.becomeSellerRepository.create({
      page_options: normalizedPageOptions as any,
      commissions: createBecomeSellerDto.commissions as any,
      language,
    });

    return this.becomeSellerRepository.save(becomeSeller);
  }

  async findAll(): Promise<BecomeSeller> {
    // Get the default language configuration (usually English)
    const becomeSeller = await this.becomeSellerRepository.findOne({
      where: { language: 'en' },
    });

    if (!becomeSeller) {
      // If no configuration exists, return empty object
      return {
        id: 0,
        page_options: {
          page_options: {
            banner: null,
            sellingStepsTitle: '',
            sellingStepsDescription: '',
            sellingStepsItem: [],
            purposeTitle: '',
            purposeDescription: '',
            purposeItems: [],
            commissionTitle: '',
            commissionDescription: '',
            faqTitle: '',
            faqDescription: '',
            faqItems: [],
          },
        },
        commissions: [],
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as BecomeSeller;
    }

    return becomeSeller;
  }

  async findOne(id: number): Promise<BecomeSeller> {
    const becomeSeller = await this.becomeSellerRepository.findOne({
      where: { id },
    });

    if (!becomeSeller) {
      throw new NotFoundException(
        `Become seller configuration with ID ${id} not found`,
      );
    }

    return becomeSeller;
  }

  async update(
    id: number,
    updateBecomeSellerDto: UpdateBecomeSellerDto,
  ): Promise<BecomeSeller> {
    const becomeSeller = await this.findOne(id);

    // Update fields with type assertion to handle the mismatch
    if (updateBecomeSellerDto.page_options) {
      becomeSeller.page_options = this.normalizePageOptions(
        updateBecomeSellerDto.page_options,
      ) as any;
    }

    if (updateBecomeSellerDto.commissions) {
      becomeSeller.commissions = updateBecomeSellerDto.commissions as any;
    }

    if (updateBecomeSellerDto.language) {
      becomeSeller.language = updateBecomeSellerDto.language;
    }

    return this.becomeSellerRepository.save(becomeSeller);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const becomeSeller = await this.findOne(id);

    await this.becomeSellerRepository.remove(becomeSeller);

    return {
      success: true,
      message: `Become seller configuration with ID ${id} deleted successfully`,
    };
  }

  // Helper method to initialize default data from JSON
  async initializeDefaultData(): Promise<void> {
    const count = await this.becomeSellerRepository.count();

    if (count === 0) {
      try {
        // Parse JSON data
        const defaultData = plainToClass(BecomeSeller, becomeSellerJson as any);

        // Create default configuration
        await this.becomeSellerRepository.save({
          ...defaultData,
          language: 'en',
        });

        console.log('✅ Default become seller configuration initialized');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          '❌ Failed to initialize default become seller data:',
          message,
        );
      }
    }
  }
}
