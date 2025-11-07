import { Injectable, NotFoundException } from '@nestjs/common';
import { GetStockSymbolResponse } from '../dto/responses/get-stock-symbol.dto';
import { StockRepository } from '../repositories/stock.repository';
import { StockFetchService } from './fetcher.service';

/**
 * Service responsible for business logic around stocks and prices.
 * Uses StockRepository for all data access.
 */
@Injectable()
export class StockService {
  constructor(private readonly stockRepo: StockRepository, private readonly priceFetcher: StockFetchService) {
  }

  /**
   * Returns the latest stock price info and computed moving average for a given symbol.
   * If the stock is found but has no prices, returns zeroes for price values.
   */
  async getStockSymbol(symbol: string): Promise<GetStockSymbolResponse> {

    // THIS LINE IS CORRECT
    const stock = await this.stockRepo.findStockBySymbolWithPrices(symbol); //

    if (!stock) {
      throw new NotFoundException(
        `Stock with symbol ${symbol} not found. Use PUT /stock/${symbol} to start tracking it.`,
      );
    }

    // Because of the 'await' above, 'stock' is NOT a promise here.
    // 'stock.prices' and 'stock.symbol' will be available.
    const prices = stock.prices;

    // No recorded prices yet
    if (prices.length === 0) {
      return {
        symbol: stock.symbol,
        currentPrice: 0,
        avgPrice: 0,
        updatedAt: stock.updatedAt,
      };
    }

    const values = prices.map(p => p.value);
    const currentPrice = values[0];
    const avgPrice = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      symbol: stock.symbol,
      currentPrice,
      avgPrice,
      updatedAt: stock.updatedAt,
    };
  }

  /**
   * Starts tracking a given stock symbol.
   */
  async startStockSymbol(symbol: string): Promise<void> {
    const price = await this.priceFetcher.getStockQuote(symbol);

    if (price === null) {
      throw new NotFoundException(
        `Stock symbol '${symbol}' was not found in Finnhub API.`,
      );
    }

    const stock = await this.stockRepo.trackStock(symbol);
    await this.stockRepo.createPriceForStock(stock.id, price);
  }
}