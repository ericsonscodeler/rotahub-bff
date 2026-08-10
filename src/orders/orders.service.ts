import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly httpService: HttpService) {}

  create(payload: CreateOrderDto) {
    return this.forward(this.httpService.post('/orders', payload));
  }

  findOne(id: string) {
    return this.forward(this.httpService.get(`/orders/${id}`));
  }

  findAll(query: Record<string, string>) {
    return this.forward(this.httpService.get('/orders', { params: query }));
  }

  private async forward<T>(request: Observable<AxiosResponse<T>>): Promise<T> {
    try {
      const response = await firstValueFrom(request);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }
}
