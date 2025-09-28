import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Payment } from '../../payment/entities/payment.entity';
import { Order } from '../../order/entities/order.entity';

export enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 虛擬屬性
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // 隱藏敏感信息
  toJSON() {
    const { password, emailVerificationToken, passwordResetToken, ...user } = this;
    return user;
  }
}
