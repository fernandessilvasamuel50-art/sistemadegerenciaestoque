import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { Movement, MovementType } from '../movements/entities/movement.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,

    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const sale = this.saleRepository.create({
      payment_method: createSaleDto.payment_method,
      total: 0,
    });

    await this.saleRepository.save(sale);

    let total = 0;

    for (const item of createSaleDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Produto ID ${item.productId} não encontrado`);
      }

      const subtotal = item.quantity * item.unit_price;
      total += subtotal;

      const saleItem = this.saleItemRepository.create({
        sale,
        product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal,
      });

      await this.saleItemRepository.save(saleItem);

      const recipe = await this.recipeRepository.findOne({
        where: {
          product: {
            id: product.id,
          },
        },
        relations: ['items', 'items.ingredient', 'product'],
      });

      if (recipe) {
        for (const recipeItem of recipe.items) {
          const ingredient = recipeItem.ingredient;
          const quantityToRemove = Number(recipeItem.quantity) * item.quantity;

          const ingredientMovements = await this.movementRepository.find({
            where: { product: { id: ingredient.id } },
            relations: ['product'],
          });

          let ingredientStock = 0;

          for (const mov of ingredientMovements) {
            if (mov.type === MovementType.ENTRADA) ingredientStock += mov.quantity;
            if (mov.type === MovementType.SAIDA) ingredientStock -= mov.quantity;
          }

          if (quantityToRemove > ingredientStock) {
            throw new BadRequestException(
              `Estoque insuficiente para o ingrediente ${ingredient.nome}`,
            );
          }

          const movement = this.movementRepository.create({
            product: ingredient,
            type: MovementType.SAIDA,
            quantity: quantityToRemove,
          });

          await this.movementRepository.save(movement);
        }
      } else {
        const productMovements = await this.movementRepository.find({
          where: { product: { id: product.id } },
          relations: ['product'],
        });

        let stock = 0;

        for (const mov of productMovements) {
          if (mov.type === MovementType.ENTRADA) stock += mov.quantity;
          if (mov.type === MovementType.SAIDA) stock -= mov.quantity;
        }

        if (item.quantity > stock) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${product.nome}`,
          );
        }

        const movement = this.movementRepository.create({
          product,
          type: MovementType.SAIDA,
          quantity: item.quantity,
        });

        await this.movementRepository.save(movement);
      }
    }

    sale.total = total;
    await this.saleRepository.save(sale);

    return await this.findOne(sale.id);
  }

  async findAll() {
    return await this.saleRepository.find({
      relations: ['items', 'items.product'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    return sale;
  }

  async update(id: number, _updateSaleDto: UpdateSaleDto) {
    await this.findOne(id);

    return {
      message: 'Atualização de venda ainda não implementada',
      saleId: id,
    };
  }

  async remove(id: number) {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);

    return {
      message: 'Venda removida com sucesso',
    };
  }
}