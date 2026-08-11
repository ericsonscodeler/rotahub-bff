import { HttpException } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';

export async function forwardHttpCall<T>(
  request: Observable<AxiosResponse<T>>,
): Promise<T> {
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
