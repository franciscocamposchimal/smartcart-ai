import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @InjectRepository(Receipt)
    private receiptsRepo: Repository<Receipt>,
    private llmService: LlmService,
  ) {}

  async create(userId: string, dto: CreateReceiptDto): Promise<Receipt> {
    let extractedItems = null;

    // If image provided, use LLM OCR to extract items
    if (dto.imageBase64) {
      extractedItems = await this.llmService.extractReceiptItems(dto.imageBase64);
      this.logger.log(`Extracted ${extractedItems?.length || 0} items from receipt`);
    }

    const receipt = this.receiptsRepo.create({
      userId,
      cartId: dto.cartId,
      storeId: dto.storeId,
      total: dto.total,
      notes: dto.notes,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
      extractedItems,
    });

    return this.receiptsRepo.save(receipt);
  }

  async findAllByUser(userId: string): Promise<Receipt[]> {
    return this.receiptsRepo.find({
      where: { userId },
      relations: ['store'],
      order: { purchaseDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Receipt> {
    const receipt = await this.receiptsRepo.findOne({
      where: { id },
      relations: ['store'],
    });
    if (!receipt) throw new NotFoundException(`Receipt ${id} not found`);
    if (receipt.userId !== userId) throw new ForbiddenException();
    return receipt;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.receiptsRepo.delete(id);
  }
}
