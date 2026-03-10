import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Movement } from '../movements/entities/movement.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll() {
    return await this.productRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    return {
      message: 'Produto removido com sucesso',
    };
  }

  async getStock(productId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const movements = await this.movementRepository.find({
      where: {
        product: {
          id: productId,
        },
      },
      relations: ['product'],
    });

    let saldo = 0;

    for (const mov of movements) {
      if (mov.type === 'ENTRADA') {
        saldo += mov.quantity;
      }

      if (mov.type === 'SAIDA') {
        saldo -= mov.quantity;
      }
    }

    return {
      productId: product.id,
      product: product.nome,
      saldo,
    };
  }
}