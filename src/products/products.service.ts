import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Movement, MovementType } from '../movements/entities/movement.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,

    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(search?: string, lowStock?: boolean) {
    let products: Product[];

    if (search) {
      products = await this.productRepository.find({
        where: [
          { nome: ILike(`%${search}%`) },
          { codigo_barras: ILike(`%${search}%`) },
        ],
        order: { id: 'ASC' },
      });
    } else {
      products = await this.productRepository.find({
        order: { id: 'ASC' },
      });
    }

    const movements = await this.movementRepository.find({
      relations: ['product'],
    });

    const recipes = await this.recipeRepository.find({
      relations: ['product'],
    });

    const productIdsWithRecipe = new Set(
      recipes.map((recipe) => recipe.product?.id).filter(Boolean),
    );

    const enrichedProducts = products.map((product) => {
      let saldo = 0;

      for (const mov of movements) {
        if (mov.product?.id === product.id) {
          if (mov.type === MovementType.ENTRADA) saldo += Number(mov.quantity);
          if (mov.type === MovementType.SAIDA) saldo -= Number(mov.quantity);
        }
      }

      return {
        ...product,
        saldo: Number(saldo.toFixed(3)),
        tem_receita: productIdsWithRecipe.has(product.id),
      };
    });

    if (lowStock) {
      return enrichedProducts.filter((product) => {
        if (product.tem_receita) return false;
        return product.saldo < product.estoque_minimo;
      });
    }

    return enrichedProducts;
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

  async findDetails(id: number) {
    const product = await this.findOne(id);

    const movements = await this.movementRepository.find({
      where: {
        product: {
          id,
        },
      },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });

    let saldo = 0;

    for (const mov of movements) {
      if (mov.type === MovementType.ENTRADA) saldo += Number(mov.quantity);
      if (mov.type === MovementType.SAIDA) saldo -= Number(mov.quantity);
    }

    const recipe = await this.recipeRepository.findOne({
      where: {
        product: {
          id,
        },
      },
      relations: ['product', 'items', 'items.ingredient'],
    });

    return {
      id: product.id,
      nome: product.nome,
      codigo_barras: product.codigo_barras,
      descricao: product.descricao,
      estoque_minimo: product.estoque_minimo,
      saldo: Number(saldo.toFixed(3)),
      tem_receita: !!recipe,
      receita: recipe
        ? recipe.items.map((item) => ({
            ingrediente_id: item.ingredient.id,
            ingrediente_nome: item.ingredient.nome,
            quantidade: Number(item.quantity),
          }))
        : [],
      movimentacoes_recentes: movements.slice(0, 10).map((mov) => ({
        id: mov.id,
        tipo: mov.type,
        quantidade: Number(mov.quantity),
        lote: mov.lot,
        created_at: mov.created_at,
      })),
    };
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
      if (mov.type === MovementType.ENTRADA) saldo += Number(mov.quantity);
      if (mov.type === MovementType.SAIDA) saldo -= Number(mov.quantity);
    }

    return {
      productId: product.id,
      product: product.nome,
      saldo: Number(saldo.toFixed(3)),
    };
  }
}