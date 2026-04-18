import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetBudgetDto {
  @ApiProperty({ description: 'Spending budget for the cart', minimum: 0 })
  @IsNumber()
  @Min(0)
  budget: number;
}
