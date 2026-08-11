import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class StopDto {
  @IsUUID()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
