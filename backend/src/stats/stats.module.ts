import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Receipt } from '../receipts/entities/receipt.entity';
import { PriceHistory } from '../products/entities/price-history.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt, PriceHistory, CartItem]),
    LlmModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
