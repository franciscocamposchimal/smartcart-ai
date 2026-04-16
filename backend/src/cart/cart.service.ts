import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartStatus } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,
  ) {}

  async create(userId: string, dto: CreateCartDto): Promise<Cart> {
    const cart = this.cartRepo.create({ ...dto, userId, status: CartStatus.OPEN });
    return this.cartRepo.save(cart);
  }

  async findAllByUser(userId: string): Promise<Cart[]> {
    return this.cartRepo.find({
      where: { userId },
      relations: ['items', 'items.product', 'store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'store'],
    });
    if (!cart) throw new NotFoundException(`Cart ${id} not found`);
    if (cart.userId !== userId) throw new ForbiddenException();
    return cart;
  }

  async addItem(cartId: string, userId: string, dto: AddCartItemDto): Promise<CartItem> {
    const cart = await this.findOne(cartId, userId);

    // Check if item already exists
    const existing = await this.cartItemRepo.findOne({
      where: { cartId, productId: dto.productId },
    });

    let item: CartItem;
    if (existing) {
      existing.quantity += dto.quantity;
      existing.subtotal = existing.quantity * dto.unitPrice;
      item = await this.cartItemRepo.save(existing);
    } else {
      item = await this.cartItemRepo.save(
        this.cartItemRepo.create({
          cartId,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
          subtotal: dto.quantity * dto.unitPrice,
        }),
      );
    }

    await this.recalculateTotal(cartId);
    return item;
  }

  async removeItem(cartId: string, itemId: string, userId: string): Promise<void> {
    await this.findOne(cartId, userId);
    await this.cartItemRepo.delete(itemId);
    await this.recalculateTotal(cartId);
  }

  async saveCart(cartId: string, userId: string): Promise<Cart> {
    const cart = await this.findOne(cartId, userId);
    cart.status = CartStatus.SAVED;
    return this.cartRepo.save(cart);
  }

  async deleteCart(cartId: string, userId: string): Promise<void> {
    await this.findOne(cartId, userId);
    await this.cartRepo.delete(cartId);
  }

  private async recalculateTotal(cartId: string): Promise<void> {
    const items = await this.cartItemRepo.find({ where: { cartId } });
    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    await this.cartRepo.update(cartId, { total });
  }
}
