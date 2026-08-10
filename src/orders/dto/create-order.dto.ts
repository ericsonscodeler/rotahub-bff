import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { PartyDto } from './party.dto';

export class CreateOrderDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => PartyDto)
  sender: PartyDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => PartyDto)
  recipient: PartyDto;
}
