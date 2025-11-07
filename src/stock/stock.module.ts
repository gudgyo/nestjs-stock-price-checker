import { Module } from '@nestjs/common';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { StockRepository } from './repositories/stock.repository';
import { StockUpdateScheduler } from './services/scheduler.service';
import { StockFetchService } from './services/fetcher.service';
import { PrismaService } from '../prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [StockController],
  providers: [StockService, StockRepository, StockUpdateScheduler, StockFetchService, PrismaService],
})
export class StockModule {
}
