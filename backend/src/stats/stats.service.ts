import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Receipt } from '../receipts/entities/receipt.entity';
import { PriceHistory } from '../products/entities/price-history.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(Receipt)
    private receiptsRepo: Repository<Receipt>,
    @InjectRepository(PriceHistory)
    private priceHistoryRepo: Repository<PriceHistory>,
    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,
    private llmService: LlmService,
  ) {}

  async getSpendingByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const receipts = await this.receiptsRepo.find({
      where: { userId, purchaseDate: Between(startDate, endDate) },
      relations: ['store'],
      order: { purchaseDate: 'ASC' },
    });

    const total = receipts.reduce((sum, r) => sum + Number(r.total), 0);
    const byStore: Record<string, number> = {};

    receipts.forEach((r) => {
      const storeName = r.store?.name || 'Unknown';
      byStore[storeName] = (byStore[storeName] || 0) + Number(r.total);
    });

    return {
      total,
      count: receipts.length,
      byStore,
      receipts,
    };
  }

  async getPriceAlerts(userId: string) {
    // Find products where price increased > 10% recently
    const recent = await this.priceHistoryRepo
      .createQueryBuilder('ph')
      .where('ph.userId = :userId', { userId })
      .andWhere('ph.recordedAt >= :date', {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .leftJoinAndSelect('ph.product', 'product')
      .leftJoinAndSelect('ph.store', 'store')
      .orderBy('ph.recordedAt', 'DESC')
      .getMany();

    // Group by product and find price variations
    const byProduct: Record<string, any[]> = {};
    recent.forEach((ph) => {
      if (!byProduct[ph.productId]) byProduct[ph.productId] = [];
      byProduct[ph.productId].push(ph);
    });

    const alerts = [];
    Object.entries(byProduct).forEach(([productId, history]) => {
      if (history.length < 2) return;
      const latest = Number(history[0].price);
      const oldest = Number(history[history.length - 1].price);
      const change = ((latest - oldest) / oldest) * 100;
      if (Math.abs(change) >= 10) {
        alerts.push({
          product: history[0].product,
          latestPrice: latest,
          previousPrice: oldest,
          changePercent: change.toFixed(1),
          isIncrease: change > 0,
        });
      }
    });

    return alerts;
  }

  async getRecurringProducts(userId: string) {
    // Find products purchased more than once in last 60 days
    const items = await this.cartItemRepo
      .createQueryBuilder('ci')
      .innerJoin('ci.cart', 'cart')
      .where('cart.userId = :userId', { userId })
      .andWhere('cart.createdAt >= :date', {
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      })
      .andWhere('cart.status != :status', { status: 'open' })
      .leftJoinAndSelect('ci.product', 'product')
      .getMany();

    const byProduct: Record<string, { product: any; count: number; totalSpent: number }> = {};
    items.forEach((item) => {
      const pid = item.productId;
      if (!byProduct[pid]) {
        byProduct[pid] = { product: item.product, count: 0, totalSpent: 0 };
      }
      byProduct[pid].count += item.quantity;
      byProduct[pid].totalSpent += Number(item.subtotal);
    });

    return Object.values(byProduct)
      .filter((p) => p.count > 1)
      .sort((a, b) => b.count - a.count);
  }

  async getStoreRankings(userId: string) {
    const receipts = await this.receiptsRepo.find({
      where: { userId },
      relations: ['store'],
    });

    const byStore: Record<string, { store: any; visits: number; totalSpent: number; avgTicket: number }> = {};
    receipts.forEach((r) => {
      const storeId = r.storeId || 'unknown';
      const storeName = r.store?.name || 'Unknown';
      if (!byStore[storeId]) {
        byStore[storeId] = { store: r.store, visits: 0, totalSpent: 0, avgTicket: 0 };
      }
      byStore[storeId].visits++;
      byStore[storeId].totalSpent += Number(r.total);
    });

    return Object.values(byStore)
      .map((s) => ({ ...s, avgTicket: s.totalSpent / s.visits }))
      .sort((a, b) => b.visits - a.visits);
  }

  async getAiInsights(userId: string) {
    const [spending, recurring, alerts] = await Promise.all([
      this.getSpendingByPeriod(
        userId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date(),
      ),
      this.getRecurringProducts(userId),
      this.getPriceAlerts(userId),
    ]);

    return this.llmService.analyzeShoppingHabits(userId, {
      monthlySpending: spending.total,
      topStores: spending.byStore,
      recurringProducts: recurring.slice(0, 5).map((p) => p.product?.name),
      priceAlerts: alerts.slice(0, 3),
    });
  }
}
