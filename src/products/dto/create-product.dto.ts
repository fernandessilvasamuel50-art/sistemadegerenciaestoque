import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Arroz' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: '7891234567890' })
  @IsString()
  @IsNotEmpty({ message: 'O código de barras é obrigatório' })
  codigo_barras: string;

  @ApiProperty({ example: 'Arroz branco tipo 1', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt({ message: 'Estoque mínimo deve ser um número inteiro' })
  @Min(0, { message: 'Estoque mínimo não pode ser negativo' })
  estoque_minimo?: number;
}