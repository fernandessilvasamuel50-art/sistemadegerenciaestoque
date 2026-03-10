import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Recipe } from './entities/recipe.entity';
import { RecipeItem } from './entities/recipe-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,

    @InjectRepository(RecipeItem)
    private readonly recipeItemRepository: Repository<RecipeItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const product = await this.productRepository.findOne({
      where: { id: createRecipeDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto da receita não encontrado');
    }

    const recipe = this.recipeRepository.create({
      product,
    });

    await this.recipeRepository.save(recipe);

    for (const item of createRecipeDto.items) {
      const ingredient = await this.productRepository.findOne({
        where: { id: item.ingredientId },
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingrediente ID ${item.ingredientId} não encontrado`,
        );
      }

      const recipeItem = this.recipeItemRepository.create({
        recipe,
        ingredient,
        quantity: item.quantity,
      });

      await this.recipeItemRepository.save(recipeItem);
    }

    return await this.findOne(recipe.id);
  }

  async findAll() {
    return await this.recipeRepository.find({
      relations: ['product', 'items', 'items.ingredient'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: ['product', 'items', 'items.ingredient'],
    });

    if (!recipe) {
      throw new NotFoundException('Receita não encontrada');
    }

    return recipe;
  }

  async update(id: number, _updateRecipeDto: UpdateRecipeDto) {
    await this.findOne(id);

    return {
      message: 'Atualização de receita ainda não implementada',
      recipeId: id,
    };
  }

  async remove(id: number) {
    const recipe = await this.findOne(id);
    await this.recipeRepository.remove(recipe);

    return {
      message: 'Receita removida com sucesso',
    };
  }
}