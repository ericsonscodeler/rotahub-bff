import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { forwardHttpCall } from '../common/forward-http-call';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly httpService: HttpService) {}

  create(payload: CreateRouteDto) {
    return forwardHttpCall(this.httpService.post('/routes', payload));
  }

  findOne(id: string) {
    return forwardHttpCall(this.httpService.get(`/routes/${id}`));
  }
}
