import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from '../models/order.model';
export class AssignDeliveryDto { @IsString() deliveryAgentId:string; }
export class DeliveryStatusDto {
  @IsEnum(OrderStatus) status:OrderStatus;
  @IsOptional() @IsString() note?:string;
  @IsOptional() @IsString() failureReason?:string;
  @IsOptional() @IsNumber() @Min(0) codCollected?:number;
}
