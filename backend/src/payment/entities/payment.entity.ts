import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../auth/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  OCTOPUS_QR = 'octopus_qr',
  OCTOPUS_CARD = 'octopus_card',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'HKD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.OCTOPUS_QR,
  })
  method: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  qrCodeData: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  octopusTransactionId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  paymentToken: string;

  @Column({ type: 'text', nullable: true })
  octopusResponse: string;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @ManyToOne(() => User, user => user.payments)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
