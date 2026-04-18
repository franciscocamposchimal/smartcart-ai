import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Optional spending budget for this cart' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;
}
