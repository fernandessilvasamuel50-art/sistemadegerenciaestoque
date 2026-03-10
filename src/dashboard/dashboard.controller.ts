import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @Get('low-stock')
  getLowStock() {
    return this.dashboardService.getLowStock();
  }

  @Get('top-products')
  getTopProducts() {
    return this.dashboardService.getTopProducts();
  }
}