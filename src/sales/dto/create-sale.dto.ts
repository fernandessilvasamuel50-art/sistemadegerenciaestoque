import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class SaleItemDto {

  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;

}

export class CreateSaleDto {

  @IsOptional()
  payment_method?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

}