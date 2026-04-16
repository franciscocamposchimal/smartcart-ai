import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LookupBarcodeDto {
  @ApiProperty({ example: '7501055300096' })
  @IsString()
  barcode: string;

  @ApiProperty({ required: false, description: 'Base64 image for visual lookup' })
  @IsOptional()
  @IsString()
  imageBase64?: string;
}
