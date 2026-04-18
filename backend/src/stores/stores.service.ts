import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storesRepo.create(dto);
    return this.storesRepo.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storesRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storesRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException(`Store ${id} not found`);
    return store;
  }

  async update(id: string, dto: Partial<CreateStoreDto>): Promise<Store> {
    await this.storesRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.storesRepo.delete(id);
  }
}
