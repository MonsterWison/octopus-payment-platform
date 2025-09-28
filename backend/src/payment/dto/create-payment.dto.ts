import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'HKD';

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod = PaymentMethod.OCTOPUS_QR;
}
