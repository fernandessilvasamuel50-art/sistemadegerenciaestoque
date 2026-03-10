import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

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
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);

    const hojeFim = new Date();
    hojeFim.setHours(23, 59, 59, 999);

    const vendasHoje = await this.saleRepository.find({
      where: {
        created_at: Between(hojeInicio, hojeFim),
      },
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    const faturamentoHoje = vendasHoje.reduce((total, sale) => {
      return total + Number(sale.total);
    }, 0);

    const quantidadeVendasHoje = vendasHoje.length;

    const ticketMedioHoje =
      quantidadeVendasHoje > 0 ? faturamentoHoje / quantidadeVendasHoje : 0;

    const totalProdutos = await this.productRepository.count();
    const produtosEstoqueBaixo = await this.getLowStock();
    const produtosMaisVendidos = await this.getTopProducts();
    const produtosSobDemanda = await this.recipeRepository.count();

    return {
      faturamento_hoje: Number(faturamentoHoje.toFixed(2)),
      vendas_hoje: quantidadeVendasHoje,
      ticket_medio_hoje: Number(ticketMedioHoje.toFixed(2)),
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
      percentual_risco: number;
    }> = [];

    for (const product of produtos) {
      // Produto final com receita é sob demanda
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

      if (saldo < product.estoque_minimo) {
        let percentualRisco = 100;

        if (product.estoque_minimo > 0) {
          percentualRisco = Number(
            (((product.estoque_minimo - saldo) / product.estoque_minimo) * 100).toFixed(2),
          );
        }

        lowStockProducts.push({
          id: product.id,
          nome: product.nome,
          saldo: Number(saldo.toFixed(3)),
          estoque_minimo: product.estoque_minimo,
          percentual_risco: percentualRisco < 0 ? 0 : percentualRisco,
        });
      }
    }

    return lowStockProducts.sort((a, b) => {
      // mais crítico primeiro
      if (a.saldo !== b.saldo) {
        return a.saldo - b.saldo;
      }

      return b.estoque_minimo - a.estoque_minimo;
    });
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
      .slice(0, 10);
  }

  async getSalesChart(days = 7) {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const inicioPeriodo = new Date();
    inicioPeriodo.setDate(hoje.getDate() - (days - 1));
    inicioPeriodo.setHours(0, 0, 0, 0);

    const sales = await this.saleRepository.find({
      where: {
        created_at: Between(inicioPeriodo, hoje),
      },
      order: { created_at: 'ASC' },
    });

    const mapa: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const data = new Date(inicioPeriodo);
      data.setDate(inicioPeriodo.getDate() + i);

      const chave = data.toISOString().split('T')[0];
      mapa[chave] = 0;
    }

    for (const sale of sales) {
      const chave = new Date(sale.created_at).toISOString().split('T')[0];
      mapa[chave] = Number((mapa[chave] + Number(sale.total)).toFixed(2));
    }

    return Object.entries(mapa).map(([dia, total]) => ({
      dia,
      total,
    }));
  }
}