import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { GetPrescriptionsDto } from './dto/get-prescriptions.dto';
import { PrescriptionResponseDto, PrescriptionPaginatorDto } from './dto/prescription-response.dto';
import { ApprovePrescriptionDto } from './dto/approve-prescription.dto';
import { User } from '../users/entities/user.entity';
import { UploadsService } from '../uploads/uploads.service';
import { Permission } from '../common/enums/enums';
import { Prescription, PrescriptionStatus } from './prescription.entity';
import {
  PrescriptionHistory,
  PrescriptionHistoryAction,
} from './prescription-history.entity';
import { PrescriptionHistoryResponseDto } from './dto/prescription-history-response.dto';
import { RejectPrescriptionDto } from './dto/reject-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionHistory)
    private historyRepository: Repository<PrescriptionHistory>,
    private uploadsService: UploadsService,
  ) {}

  async create(
    customer: User,
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    if (!createPrescriptionDto.attachment_id) {
      throw new BadRequestException('attachment_id is required');
    }

    let attachment;
    try {
      attachment = await this.uploadsService.findOne(createPrescriptionDto.attachment_id);
    } catch (error) {
      throw new BadRequestException(
        `Attachment with ID ${createPrescriptionDto.attachment_id} not found. Please upload a file first.`,
      );
    }

    if (!attachment.original) {
      throw new BadRequestException('Attachment does not have a valid URL');
    }

    const prescription = this.prescriptionsRepository.create({
      image_url: attachment.original,
      attachment_id: createPrescriptionDto.attachment_id,
      notes: createPrescriptionDto.notes || null,
      medicines: createPrescriptionDto.medicines?.length
        ? createPrescriptionDto.medicines
        : null,
      status: PrescriptionStatus.PENDING,
      customer_id: customer.id,
      customer,
      shop_id: customer.shop?.id ?? customer.shops?.[0]?.id ?? null,
    });

    const saved = await this.prescriptionsRepository.save(prescription);
    await this.recordHistory({
      prescriptionId: saved.id,
      fromStatus: null,
      toStatus: PrescriptionStatus.PENDING,
      action: PrescriptionHistoryAction.CREATED,
      performedBy: customer.id,
      shopId: saved.shop_id,
    });

    const loaded = await this.findOneWithRelations(saved.id);

    if (!loaded) {
      throw new NotFoundException(`Prescription with ID ${saved.id} not found`);
    }

    return new PrescriptionResponseDto(loaded);
  }

  async findAll(
    query: GetPrescriptionsDto,
    user: User,
    shopId?: number,
  ): Promise<PrescriptionPaginatorDto> {
    const { page = 1, limit = 10, status, search, start_date, end_date } = query;
    const skip = (page - 1) * limit;
    const permissions = user.permissions ?? [];

    const queryBuilder = this.prescriptionsRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.customer', 'customer')
      .leftJoinAndSelect('prescription.shop', 'shop')
      .leftJoinAndSelect('prescription.processor', 'processor')
      .orderBy('prescription.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('prescription.status = :status', { status });
    }

    if (start_date && end_date) {
      queryBuilder.andWhere('prescription.created_at BETWEEN :start_date AND :end_date', {
        start_date,
        end_date,
      });
    }

    if (permissions.includes(Permission.SUPER_ADMIN)) {
      if (shopId) {
        queryBuilder.andWhere('prescription.shop_id = :shopId', { shopId });
      }
    } else if (permissions.includes(Permission.BRANCH_OWNER)) {
      const accessibleShopIds = this.getAccessibleShopIds(user, shopId);

      if (accessibleShopIds.length === 0) {
        return { data: [], total: 0, page, limit, total_pages: 0 };
      }

      queryBuilder.andWhere('prescription.shop_id IN (:...shopIds)', {
        shopIds: accessibleShopIds,
      });
    } else if (permissions.includes(Permission.STAFF)) {
      if (!user.shop?.id) {
        return { data: [], total: 0, page, limit, total_pages: 0 };
      }

      queryBuilder.andWhere('prescription.shop_id = :shopId', { shopId: user.shop.id });
    } else if (permissions.includes(Permission.CUSTOMER)) {
      queryBuilder.andWhere('prescription.customer_id = :customerId', { customerId: user.id });
    }

    if (search) {
      queryBuilder.andWhere(
        '(customer.name LIKE :search OR customer.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.skip(skip).take(limit);

    const [prescriptions, total] = await queryBuilder.getManyAndCount();

    return {
      data: prescriptions.map((prescription) => new PrescriptionResponseDto(prescription)),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, user: User): Promise<PrescriptionResponseDto> {
    const prescription = await this.findOneWithRelations(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    const permissions = user.permissions ?? [];
    const hasCustomerAccess = permissions.includes(Permission.CUSTOMER) && prescription.customer_id === user.id;
    const hasSuperAdminAccess = permissions.includes(Permission.SUPER_ADMIN);
    const hasStoreAccess = this.canAccessStorePrescription(user, prescription);

    if (!hasCustomerAccess && !hasSuperAdminAccess && !hasStoreAccess) {
      throw new ForbiddenException('You do not have access to this prescription');
    }

    return new PrescriptionResponseDto(prescription);
  }

  async update(
    id: number,
    updatePrescriptionDto: UpdatePrescriptionDto,
    user: User,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.findOneWithRelations(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    const hasSuperAdminAccess = user.permissions.includes(Permission.SUPER_ADMIN);
    const hasStoreAccess = this.canAccessStorePrescription(user, prescription);

    if (!hasSuperAdminAccess && !hasStoreAccess) {
      throw new ForbiddenException('You do not have permission to update this prescription');
    }

    const previousStatus = prescription.status;
    const previousAdminNotes = prescription.admin_notes;
    const previousRejectionReason = prescription.rejection_reason;

    Object.assign(prescription, updatePrescriptionDto);
    prescription.updated_at = new Date();

    const saved = await this.prescriptionsRepository.save(prescription);

    if (updatePrescriptionDto.status && updatePrescriptionDto.status !== previousStatus) {
      await this.recordHistory({
        prescriptionId: saved.id,
        fromStatus: previousStatus,
        toStatus: updatePrescriptionDto.status,
        action: PrescriptionHistoryAction.STATUS_UPDATED,
        performedBy: user.id,
        notes: updatePrescriptionDto.admin_notes ?? updatePrescriptionDto.rejection_reason ?? null,
      });
    } else if (
      (updatePrescriptionDto.admin_notes !== undefined &&
        updatePrescriptionDto.admin_notes !== previousAdminNotes) ||
      (updatePrescriptionDto.rejection_reason !== undefined &&
        updatePrescriptionDto.rejection_reason !== previousRejectionReason)
    ) {
      await this.recordHistory({
        prescriptionId: saved.id,
        fromStatus: saved.status,
        toStatus: saved.status,
        action: PrescriptionHistoryAction.NOTES_UPDATED,
        performedBy: user.id,
        notes: updatePrescriptionDto.admin_notes ?? updatePrescriptionDto.rejection_reason ?? null,
      });
    }
    const updated = await this.findOneWithRelations(saved.id);

    if (!updated) {
      throw new NotFoundException(`Prescription with ID ${saved.id} not found`);
    }

    return new PrescriptionResponseDto(updated);
  }

  async remove(id: number, user: User): Promise<{ success: boolean; message: string }> {
    const prescription = await this.findOneWithRelations(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (!(user.permissions ?? []).includes(Permission.SUPER_ADMIN)) {
      throw new ForbiddenException('Only super admins can delete prescriptions');
    }

    await this.prescriptionsRepository.remove(prescription);

    try {
      await this.uploadsService.remove(prescription.attachment_id);
    } catch (error) {
      console.error(`Failed to delete attachment ${prescription.attachment_id}:`, error);
    }

    return { success: true, message: 'Prescription deleted successfully' };
  }

  async approve(
    id: number,
    user: User,
    approveDto: ApprovePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.findOneWithRelations(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.status !== PrescriptionStatus.PENDING) {
      throw new BadRequestException(`Cannot approve prescription with status ${prescription.status}`);
    }

    const permissions = user.permissions ?? [];
    const hasSuperAdminAccess = permissions.includes(Permission.SUPER_ADMIN);
    const hasStoreAccess = this.canAccessStorePrescription(user, prescription);

    if (!hasSuperAdminAccess && !hasStoreAccess) {
      throw new ForbiddenException('You do not have permission to approve this prescription');
    }

    prescription.status = PrescriptionStatus.APPROVED;
    prescription.processed_by = user.id;
    prescription.processed_at = new Date();

    if (approveDto.admin_notes) {
      prescription.admin_notes = approveDto.admin_notes;
    }

    const saved = await this.prescriptionsRepository.save(prescription);
    await this.recordHistory({
      prescriptionId: saved.id,
      fromStatus: PrescriptionStatus.PENDING,
      toStatus: PrescriptionStatus.APPROVED,
      action: PrescriptionHistoryAction.APPROVED,
      performedBy: user.id,
      notes: approveDto.admin_notes ?? null,
    });

    const updated = await this.findOneWithRelations(saved.id);

    if (!updated) {
      throw new NotFoundException(`Prescription with ID ${saved.id} not found`);
    }

    return new PrescriptionResponseDto(updated);
  }

  async reject(
    id: number,
    user: User,
    rejectDto: RejectPrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.findOneWithRelations(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.status !== PrescriptionStatus.PENDING) {
      throw new BadRequestException(`Cannot reject prescription with status ${prescription.status}`);
    }

    const permissions = user.permissions ?? [];
    const hasSuperAdminAccess = permissions.includes(Permission.SUPER_ADMIN);
    const hasStoreAccess = this.canAccessStorePrescription(user, prescription);

    if (!hasSuperAdminAccess && !hasStoreAccess) {
      throw new ForbiddenException('You do not have permission to reject this prescription');
    }

    prescription.status = PrescriptionStatus.REJECTED;
    prescription.rejection_reason = rejectDto.reason;
    prescription.processed_by = user.id;
    prescription.processed_at = new Date();

    const saved = await this.prescriptionsRepository.save(prescription);
    await this.recordHistory({
      prescriptionId: saved.id,
      fromStatus: PrescriptionStatus.PENDING,
      toStatus: PrescriptionStatus.REJECTED,
      action: PrescriptionHistoryAction.REJECTED,
      performedBy: user.id,
      notes: rejectDto.reason,
    });

    const updated = await this.findOneWithRelations(saved.id);

    if (!updated) {
      throw new NotFoundException(`Prescription with ID ${saved.id} not found`);
    }

    return new PrescriptionResponseDto(updated);
  }

  async getMyPrescriptions(
    customerId: number,
    query: GetPrescriptionsDto,
  ): Promise<PrescriptionPaginatorDto> {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Prescription> = {
      customer_id: customerId,
    };

    if (status) {
      where.status = status;
    }

    const [prescriptions, total] = await this.prescriptionsRepository.findAndCount({
      where,
      relations: ['customer', 'shop', 'processor'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: prescriptions.map((prescription) => new PrescriptionResponseDto(prescription)),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async assignToShop(id: number, shopId: number, user: User): Promise<PrescriptionResponseDto> {
    const prescription = await this.findOneWithRelations(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (!(user.permissions ?? []).includes(Permission.SUPER_ADMIN)) {
      throw new ForbiddenException('Only super admins can assign prescriptions to shops');
    }

    prescription.shop_id = shopId;
    const saved = await this.prescriptionsRepository.save(prescription);
    await this.recordHistory({
      prescriptionId: saved.id,
      fromStatus: saved.status,
      toStatus: saved.status,
      action: PrescriptionHistoryAction.SHOP_ASSIGNED,
      performedBy: user.id,
      shopId,
    });

    const updated = await this.findOneWithRelations(saved.id);

    if (!updated) {
      throw new NotFoundException(`Prescription with ID ${saved.id} not found`);
    }

    return new PrescriptionResponseDto(updated);
  }

  async getStats(user: User, shopId?: number): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    fulfilled: number;
    total: number;
  }> {
    const permissions = user.permissions ?? [];

    if (permissions.includes(Permission.SUPER_ADMIN)) {
      const where: FindOptionsWhere<Prescription> = {};

      if (shopId) {
        where.shop_id = shopId;
      }

      const [pending, approved, rejected, fulfilled, total] = await Promise.all([
        this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.PENDING } }),
        this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.APPROVED } }),
        this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.REJECTED } }),
        this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.FULFILLED } }),
        this.prescriptionsRepository.count({ where }),
      ]);

      return { pending, approved, rejected, fulfilled, total };
    }

    if (permissions.includes(Permission.BRANCH_OWNER)) {
      const shopIds = this.getAccessibleShopIds(user, shopId);

      if (shopIds.length === 0) {
        return { pending: 0, approved: 0, rejected: 0, fulfilled: 0, total: 0 };
      }

      const [pending, approved, rejected, fulfilled, total] = await Promise.all([
        this.prescriptionsRepository.count({ where: { shop_id: In(shopIds), status: PrescriptionStatus.PENDING } }),
        this.prescriptionsRepository.count({ where: { shop_id: In(shopIds), status: PrescriptionStatus.APPROVED } }),
        this.prescriptionsRepository.count({ where: { shop_id: In(shopIds), status: PrescriptionStatus.REJECTED } }),
        this.prescriptionsRepository.count({ where: { shop_id: In(shopIds), status: PrescriptionStatus.FULFILLED } }),
        this.prescriptionsRepository.count({ where: { shop_id: In(shopIds) } }),
      ]);

      return { pending, approved, rejected, fulfilled, total };
    }

    const where: FindOptionsWhere<Prescription> = {};

    if (permissions.includes(Permission.STAFF)) {
      if (!user.shop?.id) {
        return { pending: 0, approved: 0, rejected: 0, fulfilled: 0, total: 0 };
      }

      where.shop_id = user.shop.id;
    } else if (permissions.includes(Permission.CUSTOMER)) {
      where.customer_id = user.id;
    }

    const [pending, approved, rejected, fulfilled, total] = await Promise.all([
      this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.PENDING } }),
      this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.APPROVED } }),
      this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.REJECTED } }),
      this.prescriptionsRepository.count({ where: { ...where, status: PrescriptionStatus.FULFILLED } }),
      this.prescriptionsRepository.count({ where }),
    ]);

    return { pending, approved, rejected, fulfilled, total };
  }

  private getAccessibleShopIds(user: User, shopId?: number): number[] {
    if (shopId) {
      return [shopId];
    }

    if (user.shops?.length) {
      return user.shops
        .map((shop) => shop.id)
        .filter((id): id is number => Boolean(id));
    }

    return user.shop?.id ? [user.shop.id] : [];
  }

  private canAccessStorePrescription(user: User, prescription: Prescription): boolean {
    const permissions = user.permissions ?? [];

    if (permissions.includes(Permission.SUPER_ADMIN)) {
      return true;
    }

    if (permissions.includes(Permission.BRANCH_OWNER)) {
      const shopIds = this.getAccessibleShopIds(user);
      return !prescription.shop_id || shopIds.includes(prescription.shop_id);
    }

    if (permissions.includes(Permission.STAFF)) {
      return !prescription.shop_id || prescription.shop_id === user.shop?.id;
    }

    return false;
  }

  async getHistory(id: number, user: User): Promise<PrescriptionHistoryResponseDto[]> {
    const prescription = await this.findOneWithRelations(id);

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    const permissions = user.permissions ?? [];
    const hasCustomerAccess =
      permissions.includes(Permission.CUSTOMER) && prescription.customer_id === user.id;
    const hasSuperAdminAccess = permissions.includes(Permission.SUPER_ADMIN);
    const hasStoreAccess = this.canAccessStorePrescription(user, prescription);

    if (!hasCustomerAccess && !hasSuperAdminAccess && !hasStoreAccess) {
      throw new ForbiddenException('You do not have access to this prescription history');
    }

    const entries = await this.historyRepository.find({
      where: { prescription_id: id },
      relations: ['performer'],
      order: { created_at: 'ASC' },
    });

    return entries.map((entry) => new PrescriptionHistoryResponseDto(entry));
  }

  private async recordHistory(params: {
    prescriptionId: number;
    fromStatus: PrescriptionStatus | null;
    toStatus: PrescriptionStatus;
    action: PrescriptionHistoryAction;
    performedBy?: number | null;
    notes?: string | null;
    shopId?: number | null;
  }): Promise<void> {
    const entry = this.historyRepository.create({
      prescription_id: params.prescriptionId,
      from_status: params.fromStatus,
      to_status: params.toStatus,
      action: params.action,
      performed_by: params.performedBy ?? null,
      notes: params.notes ?? null,
      shop_id: params.shopId ?? null,
    });

    await this.historyRepository.save(entry);
  }

  private async findOneWithRelations(id: number): Promise<Prescription | null> {
    return this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['customer', 'shop', 'processor'],
    });
  }
}