import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('ORDERS_SERVICE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
