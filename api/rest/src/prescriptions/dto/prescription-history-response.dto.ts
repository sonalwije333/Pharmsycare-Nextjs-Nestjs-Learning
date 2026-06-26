import { ApiProperty } from '@nestjs/swagger';
import {
  PrescriptionHistory,
  PrescriptionHistoryAction,
} from '../prescription-history.entity';
import { PrescriptionStatus } from '../prescription.entity';

export class PrescriptionHistoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  prescription_id: number;

  @ApiProperty({ enum: PrescriptionStatus, required: false })
  from_status: PrescriptionStatus | null;

  @ApiProperty({ enum: PrescriptionStatus })
  to_status: PrescriptionStatus;

  @ApiProperty({ enum: PrescriptionHistoryAction })
  action: PrescriptionHistoryAction;

  @ApiProperty({ required: false })
  performed_by: number | null;

  @ApiProperty({ required: false })
  performer_name: string | null;

  @ApiProperty({ required: false })
  notes: string | null;

  @ApiProperty({ required: false })
  shop_id: number | null;

  @ApiProperty()
  created_at: Date;

  constructor(entry: PrescriptionHistory) {
    this.id = entry.id;
    this.prescription_id = entry.prescription_id;
    this.from_status = entry.from_status;
    this.to_status = entry.to_status;
    this.action = entry.action;
    this.performed_by = entry.performed_by;
    this.performer_name = entry.performer?.name ?? null;
    this.notes = entry.notes;
    this.shop_id = entry.shop_id;
    this.created_at = entry.created_at;
  }
}
