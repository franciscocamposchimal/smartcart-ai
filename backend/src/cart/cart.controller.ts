import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { SetBudgetDto } from './dto/set-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cart' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateCartDto) {
    return this.cartService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carts for current user' })
  findAll(@CurrentUser('sub') userId: string) {
    return this.cartService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific cart' })
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.cartService.findOne(id, userId);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @Param('id') cartId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(cartId, userId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(
    @Param('id') cartId: string,
    @Param('itemId') itemId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.cartService.removeItem(cartId, itemId, userId);
  }

  @Patch(':id/save')
  @ApiOperation({ summary: 'Save/finalize a cart' })
  saveCart(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.cartService.saveCart(id, userId);
  }

  @Patch(':id/budget')
  @ApiOperation({ summary: 'Set or update the spending budget for a cart' })
  setBudget(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: SetBudgetDto,
  ) {
    return this.cartService.setBudget(id, userId, dto.budget);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cart' })
  deleteCart(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.cartService.deleteCart(id, userId);
  }
}
