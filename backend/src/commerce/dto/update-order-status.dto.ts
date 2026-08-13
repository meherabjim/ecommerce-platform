import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../models/order.model';
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus) status:OrderStatus;
  @IsOptional() @IsString() note?:string;
}
