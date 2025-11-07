import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Price, Stock } from 'generated/prisma/client';

@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async findStockBySymbolWithPrices(
    symbol: string,
  ) {
    return this.prisma.stock.findUnique({
      where: { symbol },
      include: {
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
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
    return this.prisma.price.create({
      data: {
        value,
        stockId,
      },
    });
  }
}