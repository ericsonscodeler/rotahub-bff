import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AddTrackingEventDto } from '../trackings/dto/add-tracking-event.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.ordersService.findAll(query);
  }

  @Post(':id/tracking-events')
  @HttpCode(HttpStatus.OK)
  addTrackingEvent(@Param('id') id: string, @Body() dto: AddTrackingEventDto) {
    return this.ordersService.addTrackingEvent(id, dto);
  }
}
