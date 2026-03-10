import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Receipt,
  ChefHat,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Search,
  Bell,
  Filter,
  RefreshCw,
  ChevronRight,
  Wallet,
  Store,
  Boxes,
  BarChart3,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';

const API_BASE = 'http://localhost:3000';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Produtos', icon: Package },
  { key: 'movements', label: 'Estoque', icon: ArrowLeftRight },
  { key: 'sales', label: 'Vendas', icon: Receipt },
  { key: 'recipes', label: 'Receitas', icon: ChefHat },
];

const cardHover = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -4, scale: 1.01 },
  transition: { duration: 0.28 },
};

function useApi() {
  const [dashboard, setDashboard] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJson = async (path) => {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar ${path}`);
    }
    return response.json();
  };

  const refresh = async () => {
    try {
      setLoading(true);
      setError('');
      const [
        dashboardData,
        lowStockData,
        topProductsData,
        salesChartData,
        productsData,
        salesData,
        recipesData,
        movementsData,
      ] = await Promise.all([
        fetchJson('/dashboard'),
        fetchJson('/dashboard/low-stock'),
        fetchJson('/dashboard/top-products'),
        fetchJson('/dashboard/sales-chart?days=7'),
        fetchJson('/products'),
        fetchJson('/sales'),
        fetchJson('/recipes'),
        fetchJson('/movements'),
      ]);

      setDashboard(dashboardData);
      setLowStock(lowStockData);
      setTopProducts(topProductsData);
      setSalesChart(salesChartData);
      setProducts(productsData);
      setSales(salesData);
      setRecipes(recipesData);
      setMovements(movementsData);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar os dados da API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    dashboard,
    lowStock,
    topProducts,
    salesChart,
    products,
    sales,
    recipes,
    movements,
    loading,
    error,
    refresh,
  };
}

function StatCard({ title, value, subtitle, icon: Icon, glow }) {
  return (
    <motion.div {...cardHover}>
      <Card className={`border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)] ${glow}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{title}</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{value}</h3>
              <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-3 shadow-sm">
              <Icon className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AnimatedPrimaryButton({ children, onClick, disabled, icon: Icon = ChevronRight }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (disabled || busy) return;
    setBusy(true);
    try {
      await onClick?.();
    } finally {
      setTimeout(() => setBusy(false), 1200);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || busy}
      className="group relative overflow-hidden rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(15,23,42,.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,.7)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute inset-[1px] rounded-2xl bg-slate-900" />
      <span className="relative z-10 flex items-center gap-2">
        <span>{children}</span>
        <motion.span
          animate={busy ? { x: [0, 12, 0] } : { x: 0 }}
          transition={busy ? { repeat: Infinity, duration: 0.8 } : { duration: 0.2 }}
        >
          <Icon className="h-4 w-4" />
        </motion.span>
      </span>
    </button>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function DashboardView({ data, lowStock, topProducts, salesChart, sales, refresh }) {
  const recentSales = sales.slice(0, 5);
  const totalItemsSold = topProducts.reduce((sum, item) => sum + Number(item.quantidade_vendida || 0), 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Painel gerencial"
        subtitle="Visão rápida da operação, estoque e vendas do dia."
        action={<AnimatedPrimaryButton onClick={refresh} icon={RefreshCw}>Atualizar dados</AnimatedPrimaryButton>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Faturamento hoje" value={formatCurrency(data?.faturamento_hoje)} subtitle="Valor bruto vendido no dia" icon={Wallet} glow="" />
        <StatCard title="Vendas hoje" value={data?.vendas_hoje ?? 0} subtitle="Quantidade total de vendas" icon={ShoppingCart} />
        <StatCard title="Ticket médio" value={formatCurrency(data?.ticket_medio_hoje)} subtitle="Média por venda do dia" icon={TrendingUp} />
        <StatCard title="Produtos cadastrados" value={data?.produtos_cadastrados ?? 0} subtitle="Itens disponíveis no sistema" icon={Boxes} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div {...cardHover} className="xl:col-span-2">
          <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
            <CardHeader>
              <CardTitle>Faturamento dos últimos dias</CardTitle>
              <CardDescription>Evolução diária do valor vendido.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dia" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...cardHover}>
          <Card className="h-full border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
            <CardHeader>
              <CardTitle>Resumo operacional</CardTitle>
              <CardDescription>Situação geral do restaurante.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-900">Estoque crítico</p>
                    <p className="text-xs text-amber-700">Produtos abaixo do mínimo</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-amber-950">{data?.produtos_estoque_baixo ?? 0}</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Produtos sob demanda</p>
                    <p className="text-xs text-emerald-700">Itens com receita cadastrada</p>
                  </div>
                  <ChefHat className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-emerald-950">{data?.produtos_sob_demanda ?? 0}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Itens vendidos</p>
                    <p className="text-xs text-slate-600">Soma do ranking atual</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-slate-700" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{totalItemsSold}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <motion.div {...cardHover}>
          <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
            <CardHeader>
              <CardTitle>Produtos mais vendidos</CardTitle>
              <CardDescription>Ranking dos itens com maior saída.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  Nenhum produto vendido ainda.
                </div>
              ) : (
                topProducts.map((item, index) => (
                  <div key={item.produto} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.produto}</p>
                      <p className="text-xs text-slate-500">Quantidade vendida</p>
                    </div>
                    <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">
                      {item.quantidade_vendida}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...cardHover}>
          <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
            <CardHeader>
              <CardTitle>Últimas vendas</CardTitle>
              <CardDescription>Movimento recente do caixa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  Ainda não existem vendas registradas.
                </div>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">Venda #{sale.id}</p>
                        <p className="text-xs text-slate-500">{sale.payment_method || 'Sem forma de pagamento'}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        {formatCurrency(sale.total)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sale.items?.map((item) => (
                        <Badge key={item.id} variant="outline" className="rounded-full bg-white/80">
                          {item.product?.nome} x{item.quantity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div {...cardHover}>
        <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
          <CardHeader>
            <CardTitle>Alerta de estoque baixo</CardTitle>
            <CardDescription>Itens abaixo do nível mínimo configurado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lowStock.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Nenhum produto em situação crítica.
              </div>
            ) : (
              lowStock.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl border border-red-100 bg-gradient-to-br from-white to-red-50 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.nome}</p>
                      <p className="text-xs text-slate-500">Mínimo: {item.estoque_minimo}</p>
                    </div>
                    <Badge className="rounded-full bg-red-600 text-white hover:bg-red-600">Crítico</Badge>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Saldo atual</span>
                      <span className="font-semibold text-slate-900">{item.saldo}</span>
                    </div>
                    <Progress value={Math.min(item.percentual_risco, 100)} className="h-2" />
                    <p className="text-xs text-red-600">Risco de ruptura: {item.percentual_risco}%</p>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ProductsView({ products }) {
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !search
        ? true
        : `${product.nome} ${product.codigo_barras}`.toLowerCase().includes(search.toLowerCase());

      const matchesLowStock = !onlyLowStock
        ? true
        : !product.tem_receita && Number(product.saldo || 0) < Number(product.estoque_minimo || 0);

      return matchesSearch && matchesLowStock;
    });
  }, [products, search, onlyLowStock]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Produtos"
        subtitle="Catálogo completo com saldo, código e status do item."
        action={<AnimatedPrimaryButton>Adicionar produto</AnimatedPrimaryButton>}
      />

      <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou código de barras" className="rounded-2xl border-slate-200 bg-white pl-9" />
            </div>
            <Button
              variant={onlyLowStock ? 'default' : 'outline'}
              className="rounded-2xl"
              onClick={() => setOnlyLowStock((prev) => !prev)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {onlyLowStock ? 'Mostrando estoque baixo' : 'Filtrar estoque baixo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filtered.map((product) => {
          const low = !product.tem_receita && Number(product.saldo || 0) < Number(product.estoque_minimo || 0);

          return (
            <motion.div key={product.id} {...cardHover}>
              <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-950">{product.nome}</h3>
                        {product.tem_receita && <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">Sob demanda</Badge>}
                        {low && <Badge className="rounded-full bg-red-600 text-white hover:bg-red-600">Baixo estoque</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{product.descricao || 'Sem descrição'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                      <p className="text-xs text-slate-500">Saldo</p>
                      <p className="text-lg font-semibold text-slate-950">{Number(product.saldo || 0).toFixed(3)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-5 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-slate-500">ID</p>
                      <p className="font-medium text-slate-900">#{product.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Código</p>
                      <p className="font-medium text-slate-900">{product.codigo_barras}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Estoque mínimo</p>
                      <p className="font-medium text-slate-900">{product.estoque_minimo}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Status</p>
                      <p className="font-medium text-slate-900">{product.tem_receita ? 'Receita' : 'Simples'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SalesView({ sales, topProducts, salesChart }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Vendas"
        subtitle="Acompanhe faturamento, histórico e desempenho por produto."
        action={<AnimatedPrimaryButton>Nova venda</AnimatedPrimaryButton>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div {...cardHover} className="xl:col-span-2">
          <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
            <CardHeader>
              <CardTitle>Histórico recente</CardTitle>
              <CardDescription>Resumo das vendas lançadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Venda #{sale.id}</p>
                      <p className="text-xs text-slate-500">Forma de pagamento: {sale.payment_method}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full bg-white">{sale.items?.length || 0} item(ns)</Badge>
                      <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">{formatCurrency(sale.total)}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {sale.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 text-sm">
                        <span className="text-slate-700">{item.product?.nome} x{item.quantity}</span>
                        <span className="font-medium text-slate-950">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div {...cardHover}>
            <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
              <CardHeader>
                <CardTitle>Ranking</CardTitle>
                <CardDescription>Produtos mais vendidos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topProducts.map((item, index) => (
                  <div key={item.produto} className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">{index + 1}</div>
                      <span className="text-sm font-medium text-slate-900">{item.produto}</span>
                    </div>
                    <Badge variant="secondary" className="rounded-full">{item.quantidade_vendida}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...cardHover}>
            <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
              <CardHeader>
                <CardTitle>Curva de vendas</CardTitle>
                <CardDescription>Volume financeiro recente.</CardDescription>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="dia" fontSize={12} stroke="#64748b" />
                    <YAxis fontSize={12} stroke="#64748b" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#0f172a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MovementsView({ movements }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Movimentações de estoque"
        subtitle="Entradas e saídas com histórico visual limpo e pronto para auditoria."
        action={<AnimatedPrimaryButton>Nova movimentação</AnimatedPrimaryButton>}
      />

      <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
        <CardContent className="p-4">
          <ScrollArea className="h-[560px] pr-4">
            <div className="space-y-3">
              {movements.map((movement) => {
                const entrada = movement.type === 'ENTRADA';
                return (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${entrada ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {entrada ? <CheckCircle2 className="h-5 w-5" /> : <ArrowLeftRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{movement.product?.nome}</p>
                        <p className="text-xs text-slate-500">Lote: {movement.lot || 'Sem lote'} • ID #{movement.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`rounded-full ${entrada ? 'bg-emerald-600 text-white hover:bg-emerald-600' : 'bg-red-600 text-white hover:bg-red-600'}`}>
                        {movement.type}
                      </Badge>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right">
                        <p className="text-xs text-slate-500">Quantidade</p>
                        <p className="font-semibold text-slate-950">{Number(movement.quantity).toFixed(3)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function RecipesView({ recipes }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Receitas e ficha técnica"
        subtitle="Produtos sob demanda com insumos detalhados."
        action={<AnimatedPrimaryButton>Criar receita</AnimatedPrimaryButton>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {recipes.map((recipe) => (
          <motion.div key={recipe.id} {...cardHover}>
            <Card className="border-white/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,.25)]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{recipe.product?.nome}</CardTitle>
                    <CardDescription>Receita #{recipe.id}</CardDescription>
                  </div>
                  <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">Ativa</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.ingredient?.nome}</p>
                      <p className="text-xs text-slate-500">Ingrediente</p>
                    </div>
                    <Badge variant="outline" className="rounded-full bg-white">{Number(item.quantity)} un.</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { dashboard, lowStock, topProducts, salesChart, products, sales, recipes, movements, loading, error, refresh } = useApi();
  const [active, setActive] = useState('dashboard');
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_25%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed right-5 top-5 z-50 rounded-2xl border border-emerald-200 bg-white/90 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,.3)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Painel conectado</p>
                <p className="text-xs text-slate-500">Dados sincronizados com o backend local.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto grid min-h-screen max-w-[1700px] grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/20 bg-slate-950 text-white xl:border-b-0 xl:border-r xl:border-white/10">
          <div className="flex h-full flex-col p-5">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/70">Sistema comercial</p>
                <h1 className="text-lg font-semibold">Samuel ERP Food</h1>
              </div>
            </div>

            <Separator className="my-4 bg-white/10" />

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const activeItem = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${activeItem ? 'bg-white text-slate-950 shadow-lg' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {activeItem && <ChevronRight className="ml-auto h-4 w-4" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4">
              <Card className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-400/20 p-2 text-emerald-300">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Operação ativa</p>
                      <p className="text-xs text-white/60">Backend online e sincronizado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 text-white shadow-none backdrop-blur-xl">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Status</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-white/70">Conexão API</span>
                    <Badge className="rounded-full bg-emerald-500 text-white hover:bg-emerald-500">OK</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </aside>

        <main className="p-4 md:p-6 xl:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Restaurante • Painel administrativo</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Controle completo da operação</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur md:flex md:items-center md:gap-2">
                <Clock3 className="h-4 w-4" />
                Ambiente conectado em tempo real
              </div>
              <AnimatedPrimaryButton onClick={refresh} icon={RefreshCw}>Sincronizar</AnimatedPrimaryButton>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-3xl bg-white/60 shadow-sm" />
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Erro ao carregar a interface</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <Button className="mt-4 rounded-2xl" onClick={refresh}>Tentar novamente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={active} onValueChange={setActive} className="space-y-6">
              <TabsList className="hidden" />
              <TabsContent value="dashboard" className="mt-0">
                <DashboardView
                  data={dashboard}
                  lowStock={lowStock}
                  topProducts={topProducts}
                  salesChart={salesChart}
                  sales={sales}
                  refresh={refresh}
                />
              </TabsContent>
              <TabsContent value="products" className="mt-0">
                <ProductsView products={products} />
              </TabsContent>
              <TabsContent value="movements" className="mt-0">
                <MovementsView movements={movements} />
              </TabsContent>
              <TabsContent value="sales" className="mt-0">
                <SalesView sales={sales} topProducts={topProducts} salesChart={salesChart} />
              </TabsContent>
              <TabsContent value="recipes" className="mt-0">
                <RecipesView recipes={recipes} />
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}
