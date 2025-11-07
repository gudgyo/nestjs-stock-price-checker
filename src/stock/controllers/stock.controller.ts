import { Controller, Get, Param, Put } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { GetStockSymbolResponse } from '../dto/responses/get-stock-symbol.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Returns data for requested stock symbol' })
  @ApiResponse({
    status: 200,
    description: 'Returns stock symbol with current and moving (last 10 ticks) average price',
    type: GetStockSymbolResponse,
  })
  getStockSymbol(@Param('symbol') symbol: string): Promise<GetStockSymbolResponse> {
    return this.stockService.getStockSymbol(symbol);
  }

  @Put(':symbol')
  @ApiOperation({ summary: 'Starts periodic (1 minute) checks of the requested symbol' })
  @ApiResponse({
    status: 200,
  })
  trackStockSymbol(@Param('symbol') symbol: string) {
    return this.stockService.startStockSymbol(symbol);
  }
}
