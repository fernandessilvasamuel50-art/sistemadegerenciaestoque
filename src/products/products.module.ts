import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Movement } from '../movements/entities/movement.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Movement, Recipe])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}