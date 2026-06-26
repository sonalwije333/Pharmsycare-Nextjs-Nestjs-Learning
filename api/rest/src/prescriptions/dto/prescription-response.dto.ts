import { ApiProperty } from '@nestjs/swagger';
import {
  Prescription,
  PrescriptionStatus,
  PrescriptionMedicine,
} from '../prescription.entity';

export class PrescriptionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  image_url: string;

  @ApiProperty()
  attachment_id: string;

  @ApiProperty()
  notes: string;

  @ApiProperty({ required: false, type: 'array' })
  medicines: PrescriptionMedicine[];

  @ApiProperty()
  admin_notes: string;

  @ApiProperty({ enum: PrescriptionStatus })
  status: PrescriptionStatus;

  @ApiProperty()
  customer_id: number;

  @ApiProperty()
  customer_name: string;

  @ApiProperty()
  customer_email: string;

  @ApiProperty({ required: false })
  shop_id?: number;

  @ApiProperty({ required: false })
  shop_name?: string;

  @ApiProperty({ required: false })
  processed_by?: number;

  @ApiProperty({ required: false })
  processor_name?: string;

  @ApiProperty({ required: false })
  rejection_reason?: string;

  @ApiProperty()
  processed_at?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  constructor(prescription: Prescription) {
    this.id = prescription.id;
    this.image_url = prescription.image_url;
    this.attachment_id = prescription.attachment_id;
    this.notes = prescription.notes;
    this.medicines = prescription.medicines ?? [];
    this.admin_notes = prescription.admin_notes;
    this.status = prescription.status;
    this.customer_id = prescription.customer_id;
    this.customer_name = prescription.customer?.name;
    this.customer_email = prescription.customer?.email;
    this.shop_id = prescription.shop_id;
    this.shop_name = prescription.shop?.name;
    this.processed_by = prescription.processed_by;
    this.processor_name = prescription.processor?.name;
    this.rejection_reason = prescription.rejection_reason;
    this.processed_at = prescription.processed_at;
    this.created_at = prescription.created_at;
    this.updated_at = prescription.updated_at;
  }
}

export class PrescriptionPaginatorDto {
  @ApiProperty({ type: [PrescriptionResponseDto] })
  data: PrescriptionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total_pages: number;
}