import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeTokenDto {
  @ApiProperty({ description: 'Supabase access token obtained after OAuth sign-in' })
  @IsString()
  supabaseToken: string;
}
