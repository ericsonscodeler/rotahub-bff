import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { NotificationsService } from '../notifications/notifications.service';
import { TrackingsService } from '../trackings/trackings.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpService: { post: jest.Mock; get: jest.Mock };
  let trackingsService: {
    create: jest.Mock;
    findByOrderId: jest.Mock;
    addEvent: jest.Mock;
  };
  let notificationsService: { findByOrderId: jest.Mock };

  beforeEach(async () => {
    httpService = { post: jest.fn(), get: jest.fn() };
    trackingsService = {
      create: jest.fn(),
      findByOrderId: jest.fn(),
      addEvent: jest.fn(),
    };
    notificationsService = { findByOrderId: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: HttpService, useValue: httpService },
        { provide: TrackingsService, useValue: trackingsService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it('creates the order, initializes tracking and returns a combined view', async () => {
    httpService.post.mockReturnValue(
      of({ data: { id: '1', status: 'CREATED' } }),
    );
    trackingsService.create.mockResolvedValue({ status: 'AWAITING_PICKUP' });

    const result = await service.create({
      sender: { name: 'A', address: 'X' },
      recipient: { name: 'B', address: 'Y' },
    } as never);

    expect(trackingsService.create).toHaveBeenCalledWith('1');
    expect(result).toEqual({
      id: '1',
      status: 'CREATED',
      tracking: { status: 'AWAITING_PICKUP' },
    });
  });

  it('combines order and tracking on findOne', async () => {
    httpService.get.mockReturnValue(of({ data: { id: '1' } }));
    trackingsService.findByOrderId.mockResolvedValue({ status: 'IN_TRANSIT' });

    const result = await service.findOne('1');

    expect(result).toEqual({ id: '1', tracking: { status: 'IN_TRANSIT' } });
  });

  it('returns tracking null when no tracking exists yet for the order', async () => {
    httpService.get.mockReturnValue(of({ data: { id: '1' } }));
    trackingsService.findByOrderId.mockRejectedValue(
      new HttpException('Not Found', 404),
    );

    const result = await service.findOne('1');

    expect(result).toEqual({ id: '1', tracking: null });
  });

  it('rethrows downstream errors as HttpException with the same status and body', async () => {
    const axiosError = new AxiosError('Not Found');
    axiosError.response = {
      status: 404,
      data: { error: 'not found' },
      statusText: 'Not Found',
      headers: {},
      config: axiosError.config,
    } as never;
    httpService.get.mockReturnValue(throwError(() => axiosError));

    expect.assertions(3);
    try {
      await service.findOne('missing');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(404);
      expect((error as HttpException).getResponse()).toEqual({
        error: 'not found',
      });
    }
  });

  it('delegates notifications lookup to NotificationsService', async () => {
    notificationsService.findByOrderId.mockResolvedValue([
      { subject: 'Pedido entregue' },
    ]);

    const result = await service.getNotifications('1');

    expect(notificationsService.findByOrderId).toHaveBeenCalledWith('1');
    expect(result).toEqual([{ subject: 'Pedido entregue' }]);
  });
});
