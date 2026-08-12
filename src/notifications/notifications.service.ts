import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { forwardHttpCall } from '../common/forward-http-call';

@Injectable()
export class NotificationsService {
  constructor(private readonly httpService: HttpService) {}

  findByOrderId(orderId: string) {
    return forwardHttpCall(this.httpService.get(`/notifications/${orderId}`));
  }
}
