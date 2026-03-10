import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ nullable: true })
  payment_method?: string; // dinheiro, pix, cartão etc.

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => SaleItem, item => item.sale, { cascade: true })
  items: SaleItem[];
}