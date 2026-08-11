import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('ROUTING_SERVICE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
