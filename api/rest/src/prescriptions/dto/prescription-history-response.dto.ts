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

  @ApiProperty({ enum: PrescriptionHistoryAction })
  action: PrescriptionHistoryAction;

  @ApiProperty({ enum: PrescriptionStatus, required: false })
  from_status: PrescriptionStatus | null;

  @ApiProperty({ enum: PrescriptionStatus, required: false })
  to_status: PrescriptionStatus | null;

  @ApiProperty({ required: false })
  notes: string | null;

  @ApiProperty({ required: false })
  performed_by: number | null;

  @ApiProperty({ required: false })
  performer_name: string | null;

  @ApiProperty({ required: false })
  shop_id: number | null;

  @ApiProperty()
  created_at: Date;

  constructor(history: PrescriptionHistory) {
    this.id = history.id;
    this.prescription_id = history.prescription_id;
    this.action = history.action;
    this.from_status = history.from_status;
    this.to_status = history.to_status;
    this.notes = history.notes;
    this.performed_by = history.performed_by;
    this.performer_name = history.performer?.name ?? null;
    this.shop_id = history.shop_id;
    this.created_at = history.created_at;
  }
}
