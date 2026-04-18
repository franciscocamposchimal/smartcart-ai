import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('spending')
  @ApiOperation({ summary: 'Get spending stats by period' })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-12-31' })
  getSpending(
    @CurrentUser('sub') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    return this.statsService.getSpendingByPeriod(userId, start, end);
  }

  @Get('price-alerts')
  @ApiOperation({ summary: 'Get price variation alerts' })
  getPriceAlerts(@CurrentUser('sub') userId: string) {
    return this.statsService.getPriceAlerts(userId);
  }

  @Get('recurring')
  @ApiOperation({ summary: 'Get recurring products' })
  getRecurring(@CurrentUser('sub') userId: string) {
    return this.statsService.getRecurringProducts(userId);
  }

  @Get('stores')
  @ApiOperation({ summary: 'Get store rankings' })
  getStoreRankings(@CurrentUser('sub') userId: string) {
    return this.statsService.getStoreRankings(userId);
  }

  @Get('ai-insights')
  @ApiOperation({ summary: 'Get AI-powered shopping insights (LLM)' })
  getAiInsights(@CurrentUser('sub') userId: string) {
    return this.statsService.getAiInsights(userId);
  }
}
