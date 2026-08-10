import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpService: { post: jest.Mock; get: jest.Mock };

  beforeEach(async () => {
    httpService = { post: jest.fn(), get: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it('returns the response data on success', async () => {
    httpService.get.mockReturnValue(of({ data: { id: '1' } }));

    const result = await service.findOne('1');

    expect(result).toEqual({ id: '1' });
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
});
