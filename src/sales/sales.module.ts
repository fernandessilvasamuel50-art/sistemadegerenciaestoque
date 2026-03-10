import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { Movement } from '../movements/entities/movement.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { RecipeItem } from '../recipes/entities/recipe-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      SaleItem,
      Product,
      Movement,
      Recipe,
      RecipeItem,
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}