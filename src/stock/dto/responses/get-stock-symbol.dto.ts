import { ApiProperty } from '@nestjs/swagger';

export class GetStockSymbolResponse {
  @ApiProperty({
    description: 'Requested stock symbol',
    example: 'AAPL',
  })
  symbol: string;

  @ApiProperty({
    description: 'Last updated price',
    minimum: 0,
    example: 12.5323,
  })
  currentPrice: number;

  @ApiProperty({
    description: 'Last updated avg of ticker.',
    minimum: 0,
    example: 22.5323,
  })
  avgPrice: number;

  @ApiProperty({
    description: 'Date value of last update.',
  })
  updatedAt: Date;
}
