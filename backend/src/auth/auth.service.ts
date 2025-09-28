import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName, phone } = registerDto;

    // 檢查用戶是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('此電子郵件已被註冊');
      }
      if (existingUser.username === username) {
        throw new ConflictException('此用戶名已被使用');
      }
    }

    // 加密密碼
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 創建用戶
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      emailVerificationToken: uuidv4(),
    });

    const savedUser = await this.userRepository.save(user);

    // 生成JWT令牌
    const tokens = await this.generateTokens(savedUser);

    return {
      user: savedUser,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // 查找用戶
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('無效的登入憑證');
    }

    // 檢查用戶狀態
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('帳戶已被停用');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('帳戶已被暫停');
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('無效的登入憑證');
    }

    // 更新最後登入時間
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // 生成JWT令牌
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('無效的刷新令牌');
      }

      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('無效的刷新令牌');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }

    // 驗證當前密碼
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('當前密碼不正確');
    }

    // 加密新密碼
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密碼
    await this.userRepository.update(userId, {
      password: hashedNewPassword,
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // 為了安全，不透露用戶是否存在
      return;
    }

    // 生成密碼重置令牌
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1小時後過期

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // 這裡應該發送重置密碼的電子郵件
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: new Date(), // 檢查是否過期
      },
    });

    if (!user) {
      throw new BadRequestException('無效或過期的重置令牌');
    }

    // 加密新密碼
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密碼並清除重置令牌
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('無效的驗證令牌');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }

    return user;
  }

  async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }

    // 不允許更新敏感字段
    const { password, email, username, role, status, ...allowedUpdates } = updateData;

    await this.userRepository.update(userId, allowedUpdates);

    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  private async generateTokens(user: User): Promise<Omit<AuthResponse, 'user'>> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15分鐘
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('用戶不存在或已被停用');
    }

    return user;
  }
}
