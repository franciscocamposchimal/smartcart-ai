import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PriceHistory } from './entities/price-history.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { LookupBarcodeDto } from './dto/lookup-barcode.dto';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(PriceHistory)
    private priceHistoryRepo: Repository<PriceHistory>,
    private llmService: LlmService,
  ) {}

  async lookupBarcode(dto: LookupBarcodeDto): Promise<Product> {
    // Check DB first
    if (dto.barcode) {
      const existing = await this.productsRepo.findOne({
        where: { barcode: dto.barcode },
      });
      if (existing) return existing;
    }

    // Use LLM to identify product
    const llmResult = await this.llmService.identifyProduct(
      dto.barcode,
      dto.imageBase64,
    );

    // Save to DB
    const product = this.productsRepo.create({
      barcode: dto.barcode,
      name: llmResult.name,
      brand: llmResult.brand,
      category: llmResult.category,
      description: llmResult.description,
      llmMetadata: llmResult,
    });

    return this.productsRepo.save(product);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepo.create(dto);
    return this.productsRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepo.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productsRepo.findOne({ where: { barcode } });
    if (!product) throw new NotFoundException(`Barcode ${barcode} not found`);
    return product;
  }

  async recordPrice(
    productId: string,
    price: number,
    userId: string,
    storeId?: string,
  ): Promise<PriceHistory> {
    const ph = this.priceHistoryRepo.create({
      productId,
      price,
      userId,
      storeId,
    });
    return this.priceHistoryRepo.save(ph);
  }

  async getPriceHistory(productId: string): Promise<PriceHistory[]> {
    return this.priceHistoryRepo.find({
      where: { productId },
      order: { recordedAt: 'DESC' },
      relations: ['store'],
    });
  }
}
