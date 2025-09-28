import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

// 內存存儲用戶數據
const users: User[] = [];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, phone, firstName, lastName } = registerDto;

    // 檢查用戶是否已存在
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      throw new ConflictException('用戶已存在');
    }

    // 創建新用戶
    const user = new User();
    user.id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    user.email = email;
    user.username = username;
    user.password = password; // 在演示模式下不加密
    user.phone = phone;
    user.firstName = firstName;
    user.lastName = lastName;
    user.role = UserRole.CUSTOMER;
    user.status = UserStatus.ACTIVE;
    user.avatar = null;
    user.lastLoginAt = null;
    user.lastLoginIp = null;
    user.emailVerified = false;
    user.emailVerificationToken = null;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.orders = [];
    user.payments = [];
    user.createdAt = new Date();
    user.updatedAt = new Date();

    users.push(user);

    // 生成JWT tokens
    const tokens = await this.generateTokens(user);
    
    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // 查找用戶
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }

    // 驗證密碼（演示模式下簡化）
    if (user.password !== password) {
      throw new UnauthorizedException('密碼錯誤');
    }

    // 生成JWT tokens
    const tokens = await this.generateTokens(user);
    
    return {
      user,
      ...tokens,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = users.find(u => u.id === payload.sub);
    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }
    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }

    if (user.password !== currentPassword) {
      throw new UnauthorizedException('當前密碼錯誤');
    }

    user.password = newPassword;
    user.updatedAt = new Date();
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      // 在演示模式下不暴露用戶是否存在
      return;
    }

    // 在演示模式下，我們只是記錄這個請求
    console.log(`Password reset requested for user: ${email}`);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;
    
    // 在演示模式下，我們假設token是有效的
    if (!token || token.length < 10) {
      throw new BadRequestException('無效的重置token');
    }

    // 在演示模式下，我們無法驗證token，所以跳過這個功能
    console.log(`Password reset attempted with token: ${token}`);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // 在演示模式下，我們假設refreshToken是有效的
      const payload = this.jwtService.decode(refreshToken) as JwtPayload;
      if (!payload) {
        throw new UnauthorizedException('無效的refresh token');
      }

      const user = users.find(u => u.id === payload.sub);
      if (!user) {
        throw new UnauthorizedException('用戶不存在');
      }

      const tokens = await this.generateTokens(user);
      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('無效的refresh token');
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('用戶不存在');
    }
    return user;
  }

  async updateUserProfile(userId: string, updateData: any): Promise<User> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new UnauthorizedException('用戶不存在');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    return users[userIndex];
  }

  async verifyEmail(token: string): Promise<void> {
    // 在演示模式下，我們假設token是有效的
    if (!token || token.length < 10) {
      throw new BadRequestException('無效的驗證token');
    }

    // 在演示模式下，我們無法驗證token，所以跳過這個功能
    console.log(`Email verification attempted with token: ${token}`);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const expiresIn = 15 * 60; // 15 minutes

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}
