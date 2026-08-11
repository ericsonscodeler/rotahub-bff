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

  async findOne(id: string) {
    const order = await forwardHttpCall(this.httpService.get(`/orders/${id}`));
    try {
      const tracking = await this.trackingsService.findByOrderId(id);
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

  findAll(query: Record<string, string>) {
    return forwardHttpCall(this.httpService.get('/orders', { params: query }));
  }

  addTrackingEvent(id: string, payload: AddTrackingEventDto) {
    return this.trackingsService.addEvent(id, payload);
  }
}
