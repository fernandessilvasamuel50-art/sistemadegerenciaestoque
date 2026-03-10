import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

import { Sale } from '../sales/entities/sale.entity';
import { Product } from '../products/entities/product.entity';
import { Movement } from '../movements/entities/movement.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Product, Movement, Recipe])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}