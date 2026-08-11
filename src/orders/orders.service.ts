import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { forwardHttpCall } from '../common/forward-http-call';
import { AddTrackingEventDto } from '../trackings/dto/add-tracking-event.dto';
import { TrackingsService } from '../trackings/trackings.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly trackingsService: TrackingsService,
  ) {}

  async create(payload: CreateOrderDto) {
    const order = await forwardHttpCall(
      this.httpService.post('/orders', payload),
    );
    const tracking = await this.trackingsService.create(order.id);
    return { ...order, tracking };
  }

  findOne(id: string) {
    return this.withTracking(
      forwardHttpCall(this.httpService.get(`/orders/${id}`)),
    );
  }

  findByTrackingCode(trackingCode: string) {
    return this.withTracking(
      forwardHttpCall(
        this.httpService.get(`/orders/by-tracking-code/${trackingCode}`),
      ),
    );
  }

  findAll(query: Record<string, string>) {
    return forwardHttpCall(this.httpService.get('/orders', { params: query }));
  }

  addTrackingEvent(id: string, payload: AddTrackingEventDto) {
    return this.trackingsService.addEvent(id, payload);
  }

  private async withTracking(orderRequest: Promise<any>) {
    const order = await orderRequest;
    try {
      const tracking = await this.trackingsService.findByOrderId(order.id);
      return { ...order, tracking };
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.NOT_FOUND
      ) {
        return { ...order, tracking: null };
      }
      throw error;
    }
  }
}
