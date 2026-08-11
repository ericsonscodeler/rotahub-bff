import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { StopDto } from './stop.dto';

export class CreateRouteDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops: StopDto[];
}
