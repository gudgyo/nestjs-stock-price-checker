import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { StockModule } from './stock/stock.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({ isGlobal: true }),
    StockModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {
}
