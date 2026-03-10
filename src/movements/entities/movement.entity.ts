import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

@Entity('movements')
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ nullable: true })
  lot?: string;

  @CreateDateColumn()
  created_at: Date;
}