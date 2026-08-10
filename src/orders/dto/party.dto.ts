import { IsNotEmpty, IsString } from 'class-validator';

export class PartyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
