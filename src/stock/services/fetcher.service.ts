import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { AxiosError } from 'axios';

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

/**
 * A service to encapsulate communication with the Finnhub API.
 */
@Injectable()
export class StockFetchService {
  private readonly logger = new Logger(StockFetchService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://finnhub.io/api/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('FINNHUB_API_KEY');

    // Fail-fast on startup if the token is missing
    if (!this.apiKey) {
      this.logger.error('FINNHUB_API_KEY is not set in environment variables.');
      throw new Error('FINNHUB_API_KEY is not configured.');
    }
  }

  /**
   * Fetches the current quote for a given stock symbol.
   * @param symbol The stock symbol (e.g., AAPL)
   * @returns The current price, or null if an error occurs.
   */
  async getStockQuote(symbol: string): Promise<number | null> {
    const url = `${this.baseUrl}/quote`;

    const response: FinnhubQuote = await firstValueFrom(
      this.httpService
        .get<FinnhubQuote>(url, {
          params: { symbol, token: this.apiKey },
        })
        .pipe(
          map((res) => res.data),
          catchError((error: AxiosError) => {
            // Log the detailed error here
            this.logger.error(
              `Failed to fetch price for ${symbol}: ${error.message}`,
            );
            if (error.response) {
              this.logger.error(
                `Response Status: ${error.response.status}, Response Data: ${JSON.stringify(
                  error.response.data,
                )}`,
              );
            }
            return of(null);
          }),
        ),
    );

    if (!response) {
      return null;
    }

    if (typeof response.c === 'number' && response.c > 0) {
      return response.c;
    }

    this.logger.warn(`Received zero price or invalid data for ${symbol}. ${JSON.stringify(response)})`);
    return null;
  }
}