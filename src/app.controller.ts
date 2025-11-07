import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() {
  }

  @Get('hc')
  @ApiOperation({ summary: 'Health check' })
  healthcheck(): string {
    return;
  }
}
