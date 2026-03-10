import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

class CreateRecipeItemDto {
  @IsNumber()
  ingredientId: number;

  @IsNumber()
  quantity: number;
}

export class CreateRecipeDto {
  @IsNumber()
  productId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeItemDto)
  items: CreateRecipeItemDto[];
}