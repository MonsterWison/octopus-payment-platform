import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  octopusTransactionId?: string;

  @IsOptional()
  @IsString()
  octopusResponse?: string;

  @IsOptional()
  @IsString()
  failureReason?: string;
}
