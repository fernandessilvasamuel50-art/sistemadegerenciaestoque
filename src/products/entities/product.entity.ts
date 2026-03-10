import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  codigo_barras: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ type: 'int', default: 0 })
  estoque_minimo: number;

  @CreateDateColumn()
  created_at: Date;
}