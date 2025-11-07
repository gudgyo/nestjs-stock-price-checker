import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StockFetchService } from './fetcher.service';
import { StockRepository } from '../repositories/stock.repository';

@Injectable()
export class StockUpdateScheduler {
  private readonly logger = new Logger(StockUpdateScheduler.name);

  constructor(
    private readonly stockRepo: StockRepository,
    private readonly priceFetcher: StockFetchService,
  ) {
  }

  /**
   * This cron job runs every minute to update prices for all active stocks.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async updateActiveStockPrices() {
    this.logger.debug('Running scheduled job to update active stock prices...');

    const activeStocks = await this.stockRepo.findActiveStocks();
    for (const stock of activeStocks) {
      const newPrice = await this.priceFetcher.getStockQuote(stock.symbol);
      await this.stockRepo.createPriceForStock(stock.id, newPrice);
    }
  }
}