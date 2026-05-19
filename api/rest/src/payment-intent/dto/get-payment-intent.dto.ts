import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentGatewayType } from 'src/common/enums/order-payment.enum';


export class GetPaymentIntentDto {
  @ApiProperty({ description: 'Order tracking number', example: '20240207303639', type: String })
  @IsString()
  tracking_number: string;

  @ApiProperty({ description: 'Payment gateway', enum: PaymentGatewayType, example: PaymentGatewayType.STRIPE })
  @IsEnum(PaymentGatewayType)
  payment_gateway: PaymentGatewayType;

  @ApiProperty({ description: 'Recall gateway', example: false, required: false, type: Boolean })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    const v = String(value).toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
    return value;
  })
  @IsBoolean()
  recall_gateway?: boolean;
}