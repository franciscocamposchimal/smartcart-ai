import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @ApiOperation({ summary: 'Save a receipt (with optional LLM OCR extraction)' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateReceiptDto) {
    return this.receiptsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all receipts for current user' })
  findAll(@CurrentUser('sub') userId: string) {
    return this.receiptsService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific receipt' })
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.receiptsService.findOne(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a receipt' })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.receiptsService.remove(id, userId);
  }
}
