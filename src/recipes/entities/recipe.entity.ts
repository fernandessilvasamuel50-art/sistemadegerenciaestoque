import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { RecipeItem } from './recipe-item.entity';

@Entity()
export class Recipe {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product)
  @JoinColumn()
  product: Product;

  @OneToMany(() => RecipeItem, item => item.recipe, { cascade: true })
  items: RecipeItem[];
}