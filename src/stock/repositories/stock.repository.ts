import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Price, Stock } from 'generated/prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


@Injectable()
export class StockRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
  }

  async findStockBySymbolWithPrices(
    symbol: string,
  ) {
    const cacheKey = this.stockCacheKey(symbol);

    const cached = await this.cacheManager.get<Stock & { prices: Price[] }>(
      cacheKey,
    );
    if (cached) {
      return cached;
    }

    const stock = await this.prisma.stock.findUnique({
      where: { symbol },
      include: {
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (stock) {
      await this.cacheManager.set(cacheKey, stock, 60000);
    }

    return stock;
  }

  async trackStock(symbol: string): Promise<Stock> {
    return this.prisma.stock.upsert({
      where: { symbol },
      update: { isActive: true },
      create: { symbol, isActive: true },
    });
  }

  async findActiveStocks(): Promise<Stock[]> {
    return this.prisma.stock.findMany({
      where: { isActive: true },
    });
  }

  async createPriceForStock(stockId: number, value: number): Promise<Price> {
    const newPrice = await this.prisma.price.create({
      data: { value, stockId },
    });

    // Lookup the related stock symbol for targeted invalidation
    const stock = await this.prisma.stock.findUnique({
      where: { id: stockId },
      select: { symbol: true },
    });

    if (stock?.symbol) {
      await this.cacheManager.del(this.stockCacheKey(stock.symbol));
    }

    return newPrice;
  }

  private stockCacheKey(symbol: string) {
    return `stockrepo:stock:${symbol}`;
  }
}