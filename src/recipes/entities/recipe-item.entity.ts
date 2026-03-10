import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Recipe } from './recipe.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class RecipeItem {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Recipe, recipe => recipe.items)
  recipe: Recipe;

  @ManyToOne(() => Product)
  ingredient: Product;

  @Column('decimal')
  quantity: number;
}