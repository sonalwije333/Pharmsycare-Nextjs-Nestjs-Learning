import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Product name', example: 'Baby Care' })
  name: string;

  @IsOptional()
  @ApiProperty({ description: 'Product slug', example: 'baby-care' })
  slug: string;

  @IsOptional()
  @ApiProperty({ description: 'Product image' })
  image: object;

  @IsOptional()
  @ApiProperty({ description: 'Product gallery' })
  gallery: object;

  @IsOptional()
  @ApiProperty({ description: 'Product description' })
  description: string;

  @IsOptional()
  @ApiProperty({ description: 'Product type_id' })
  type_id: string;

  @IsOptional()
  @ApiProperty({ description: 'Product image' })
  price: number;

  @IsOptional()
  @ApiProperty({ description: 'Product sale_price' })
  sale_price: number;

  @IsOptional()
  @ApiProperty({ description: 'Product min_price' })
  min_price: number;

  @IsOptional()
  @ApiProperty({ description: 'Product max_price' })
  max_price: number;

  @IsOptional()
  @ApiProperty({ description: 'Product sku' })
  sku: string;

  @IsOptional()
  @ApiProperty({ description: 'Product quantity' })
  quantity: number;

  @IsOptional()
  @ApiProperty({ description: 'Product in_stock' })
  in_stock: boolean;

  @IsOptional()
  @ApiProperty({ description: 'Type is_taxable' })
  is_taxable: boolean;

  @IsOptional()
  @ApiProperty({ description: 'Product status' })
  status: boolean;

  @IsOptional()
  @ApiProperty({ description: 'Product product_type' })
  product_type: 'simple' | 'variable';

  @IsOptional()
  @ApiProperty({ description: 'Product unit' })
  unit: string;
}
