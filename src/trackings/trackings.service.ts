import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { forwardHttpCall } from '../common/forward-http-call';
import { AddTrackingEventDto } from './dto/add-tracking-event.dto';

@Injectable()
export class TrackingsService {
  constructor(private readonly httpService: HttpService) {}

  create(orderId: string) {
    return forwardHttpCall(this.httpService.post('/trackings', { orderId }));
  }

  findByOrderId(orderId: string) {
    return forwardHttpCall(this.httpService.get(`/trackings/${orderId}`));
  }

  addEvent(orderId: string, payload: AddTrackingEventDto) {
    return forwardHttpCall(
      this.httpService.post(`/trackings/${orderId}/events`, payload),
    );
  }
}
