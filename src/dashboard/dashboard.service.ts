import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sale } from '../sales/entities/sale.entity';
import { Product } from '../products/entities/product.entity';
import { Movement, MovementType } from '../movements/entities/movement.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,

    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async getDashboard() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vendasHoje = await this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.created_at >= :hoje', { hoje })
      .getMany();

    const faturamentoHoje = vendasHoje.reduce((total, sale) => {
      return total + Number(sale.total);
    }, 0);

    const totalProdutos = await this.productRepository.count();
    const produtosEstoqueBaixo = await this.getLowStock();
    const produtosMaisVendidos = await this.getTopProducts();
    const produtosSobDemanda = await this.recipeRepository.count();

    return {
      faturamento_hoje: faturamentoHoje,
      vendas_hoje: vendasHoje.length,
      produtos_cadastrados: totalProdutos,
      produtos_estoque_baixo: produtosEstoqueBaixo.length,
      produtos_sob_demanda: produtosSobDemanda,
      top_produto: produtosMaisVendidos[0] ?? null,
    };
  }

  async getLowStock() {
    const produtos = await this.productRepository.find();
    const movements = await this.movementRepository.find({
      relations: ['product'],
    });

    const recipes = await this.recipeRepository.find({
      relations: ['product'],
    });

    const productIdsWithRecipe = new Set(
      recipes.map((recipe) => recipe.product?.id).filter(Boolean),
    );

    const lowStockProducts: Array<{
      id: number;
      nome: string;
      saldo: number;
      estoque_minimo: number;
    }> = [];

    for (const product of produtos) {
      // Se o produto tem receita, ele é sob demanda.
      // Então não deve aparecer como estoque baixo do produto final.
      if (productIdsWithRecipe.has(product.id)) {
        continue;
      }

      let saldo = 0;

      for (const mov of movements) {
        if (mov.product?.id === product.id) {
          if (mov.type === MovementType.ENTRADA) {
            saldo += Number(mov.quantity);
          }

          if (mov.type === MovementType.SAIDA) {
            saldo -= Number(mov.quantity);
          }
        }
      }

      // Aqui usamos < em vez de <=
      // para não marcar como "baixo" quando saldo e mínimo forem ambos 0.
      if (saldo < product.estoque_minimo) {
        lowStockProducts.push({
          id: product.id,
          nome: product.nome,
          saldo,
          estoque_minimo: product.estoque_minimo,
        });
      }
    }

    return lowStockProducts;
  }

  async getTopProducts() {
    const sales = await this.saleRepository.find({
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    const ranking: Record<
      string,
      { produto: string; quantidade_vendida: number }
    > = {};

    for (const sale of sales) {
      for (const item of sale.items) {
        const nome = item.product.nome;

        if (!ranking[nome]) {
          ranking[nome] = {
            produto: nome,
            quantidade_vendida: 0,
          };
        }

        ranking[nome].quantidade_vendida += Number(item.quantity);
      }
    }

    return Object.values(ranking)
      .sort((a, b) => b.quantidade_vendida - a.quantidade_vendida)
      .slice(0, 5);
  }
}