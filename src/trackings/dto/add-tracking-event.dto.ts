import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PositionDto } from './position.dto';

export enum TrackingStatus {
  AWAITING_PICKUP = 'AWAITING_PICKUP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED_ATTEMPT = 'FAILED_ATTEMPT',
}

export class AddTrackingEventDto {
  @IsEnum(TrackingStatus)
  status: TrackingStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  position?: PositionDto;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsString()
  note?: string;
}
