import { IsNumber } from 'class-validator';

export class PositionDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
