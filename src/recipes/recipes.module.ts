import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';

import { Recipe } from './entities/recipe.entity';
import { RecipeItem } from './entities/recipe-item.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeItem, Product])],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}