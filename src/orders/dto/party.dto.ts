import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PartyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEmail()
  email: string;
}
