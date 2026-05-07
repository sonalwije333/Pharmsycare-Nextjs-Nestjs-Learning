import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BecomeSeller } from './entities/become-seller.entity';
import { CreateBecomeSellerDto } from './dto/create-become-seller.dto';
import { UpdateBecomeSellerDto } from './dto/update-become-seller.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class BecomeSellerService {
  constructor(
    @InjectRepository(BecomeSeller)
    private becomeSellerRepository: Repository<BecomeSeller>,
  ) {}

  async create(createBecomeSellerDto: CreateBecomeSellerDto): Promise<BecomeSeller> {
    const existing = await this.becomeSellerRepository.findOne({
      where: { language: createBecomeSellerDto.language || 'en' },
    });

    // If a configuration already exists for the requested language,
    // merge the incoming data into the existing record and save (idempotent).
    if (existing) {
      existing.page_options = createBecomeSellerDto.page_options ?? existing.page_options;
      existing.commissions = createBecomeSellerDto.commissions ?? existing.commissions;
      existing.language = createBecomeSellerDto.language ?? existing.language;

      return this.becomeSellerRepository.save(existing);
    }

    const becomeSeller = this.becomeSellerRepository.create({
      page_options: createBecomeSellerDto.page_options,
      commissions: createBecomeSellerDto.commissions,
      language: createBecomeSellerDto.language || 'en',
    });

    return this.becomeSellerRepository.save(becomeSeller);
  }

  async findAll(): Promise<BecomeSeller> {
    const becomeSeller = await this.becomeSellerRepository.findOne({
      where: { language: 'en' },
    });

    if (!becomeSeller) {
      return {
        id: 0,
        page_options: {
          // Provide an empty Attachment-shaped object to satisfy the type
          banner: ({ thumbnail: '', original: '', file_name: '' } as any),
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
        commissions: [],
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      } as BecomeSeller;
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
    let becomeSeller: BecomeSeller;

    try {
      becomeSeller = await this.findOne(id);
    } catch (err) {
      // If not found by id, try to locate by language from payload (if provided)
      if (updateBecomeSellerDto.language) {
        const found = await this.becomeSellerRepository.findOne({
          where: { language: updateBecomeSellerDto.language },
        });
        if (!found) {
          // rethrow original not found error
          throw err;
        }
        becomeSeller = found;
      } else {
        throw err;
      }
    }

    if (updateBecomeSellerDto.page_options) {
      becomeSeller.page_options = updateBecomeSellerDto.page_options;
    }

    if (updateBecomeSellerDto.commissions) {
      becomeSeller.commissions = updateBecomeSellerDto.commissions;
    }

    if (updateBecomeSellerDto.language) {
      becomeSeller.language = updateBecomeSellerDto.language;
    }

    return this.becomeSellerRepository.save(becomeSeller);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const becomeSeller = await this.findOne(id);

    await this.becomeSellerRepository.softDelete(id);

    return {
      success: true,
      message: `Become seller configuration with ID ${id} deleted successfully`,
    };
  }
}