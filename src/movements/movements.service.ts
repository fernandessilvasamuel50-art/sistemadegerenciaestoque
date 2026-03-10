import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movement } from '../movements/entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private movementRepository: Repository<Movement>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createMovementDto: CreateMovementDto) {
    const product = await this.productRepository.findOne({
      where: { id: createMovementDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const movements = await this.movementRepository.find({
      where: { product: { id: product.id } },
      relations: ['product'],
    });

    let saldo = 0;

    for (const mov of movements) {
      if (mov.type === 'ENTRADA') saldo += mov.quantity;
      if (mov.type === 'SAIDA') saldo -= mov.quantity;
    }

    if (createMovementDto.type === 'SAIDA') {
      if (createMovementDto.quantity > saldo) {
        throw new BadRequestException('Estoque insuficiente');
      }
    }

    const movement = this.movementRepository.create({
      product,
      type: createMovementDto.type,
      quantity: createMovementDto.quantity,
      lot: createMovementDto.lot,
    });

    return await this.movementRepository.save(movement);
  }

  async findAll() {
    return await this.movementRepository.find({
      relations: ['product'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const movement = await this.movementRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!movement) {
      throw new NotFoundException('Movimentação não encontrada');
    }

    return movement;
  }

  async update(id: number, updateMovementDto: UpdateMovementDto) {
    const movement = await this.findOne(id);

    if (updateMovementDto.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateMovementDto.productId },
      });

      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      movement.product = product;
    }

    if (updateMovementDto.type !== undefined) {
      movement.type = updateMovementDto.type;
    }

    if (updateMovementDto.quantity !== undefined) {
      movement.quantity = updateMovementDto.quantity;
    }

    if (updateMovementDto.lot !== undefined) {
      movement.lot = updateMovementDto.lot;
    }

    return await this.movementRepository.save(movement);
  }

  async remove(id: number) {
    const movement = await this.findOne(id);
    await this.movementRepository.remove(movement);

    return {
      message: 'Movimentação removida com sucesso',
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
      where: { product: { id: productId } },
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