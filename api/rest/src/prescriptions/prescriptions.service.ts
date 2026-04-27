// prescriptions/prescriptions.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { GetPrescriptionsDto, PrescriptionPaginator } from './dto/get-prescriptions.dto';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { paginate } from 'src/common/pagination/paginate';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const prescription = this.prescriptionsRepository.create({
      ...createPrescriptionDto,
      status: PrescriptionStatus.PENDING,
    });

    const saved = await this.prescriptionsRepository.save(prescription);
    return this.findOne(saved.id);
  }

  async findAll(query: GetPrescriptionsDto): Promise<PrescriptionPaginator> {
    const qb = this.prescriptionsRepository.createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.customer', 'customer')
      .leftJoinAndSelect('prescription.shop', 'shop');

    if (query.search) {
      const search = `%${query.search}%`;
      qb.andWhere(
        '(prescription.doctor_name LIKE :search OR prescription.hospital_name LIKE :search OR prescription.customer_notes LIKE :search)',
        { search },
      );
    }

    if (query.shop_id) qb.andWhere('prescription.shop_id = :shop_id', { shop_id: query.shop_id });
    if (query.status) qb.andWhere('prescription.status = :status', { status: query.status });
    if (query.customer_id) qb.andWhere('prescription.customer_id = :customer_id', { customer_id: query.customer_id });

    const sortBy = query.sortBy || 'prescription.created_at';
    const sortOrder = (query.sortOrder || 'DESC').toUpperCase();
    qb.orderBy(sortBy, sortOrder as 'ASC' | 'DESC');

    const limit = query.limit || 15;
    const page = query.page || 1;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      paging: {
        total,
        limit,
        page,
      },
    };
  }

  async findOne(id: number): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['customer', 'shop'],
    });

    if (!prescription) throw new NotFoundException(`Prescription with ID ${id} not found`);
    return prescription;
  }

  async findByCustomerId(customerId: number): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({ where: { customer_id: customerId } });
  }

  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);

    Object.assign(prescription, updatePrescriptionDto);
    if (updatePrescriptionDto.approved_by) prescription.approved_at = new Date();

    await this.prescriptionsRepository.save(prescription);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const prescription = await this.findOne(id);
    await this.prescriptionsRepository.delete(prescription.id);
    return { success: true, message: 'Prescription deleted successfully' };
  }

  async approvePrescription(id: number, staffId: number, notes: string): Promise<Prescription> {
    const prescription = await this.findOne(id);
    prescription.status = PrescriptionStatus.APPROVED;
    prescription.approved_by = staffId;
    prescription.approved_at = new Date();
    prescription.admin_notes = notes;

    await this.prescriptionsRepository.save(prescription);
    return this.findOne(id);
  }

  async rejectPrescription(id: number, staffId: number, notes: string): Promise<Prescription> {
    const prescription = await this.findOne(id);
    prescription.status = PrescriptionStatus.REJECTED;
    prescription.approved_by = staffId;
    prescription.approved_at = new Date();
    prescription.admin_notes = notes;

    await this.prescriptionsRepository.save(prescription);
    return this.findOne(id);
  }
}
