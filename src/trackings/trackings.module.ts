import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrackingsService } from './trackings.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('TRACKING_SERVICE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TrackingsService],
  exports: [TrackingsService],
})
export class TrackingsModule {}
