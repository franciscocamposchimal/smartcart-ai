import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { StoresModule } from './stores/stores.module';
import { LlmModule } from './llm/llm.module';
import { StatsModule } from './stats/stats.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    AuthModule,
    ProductsModule,
    CartModule,
    ReceiptsModule,
    StoresModule,
    LlmModule,
    StatsModule,
  ],
})
export class AppModule {}
