import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`新用戶註冊: ${registerDto.email}`);
      
      return {
        success: true,
        message: '註冊成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`註冊失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`用戶登入: ${loginDto.email}`);
      
      return {
        success: true,
        message: '登入成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`登入失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    try {
      const result = await this.authService.refreshToken(body.refreshToken);
      
      return {
        success: true,
        message: '令牌刷新成功',
        data: result,
      };
    } catch (error) {
      this.logger.error(`令牌刷新失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    // 在實際應用中，您可能需要將令牌加入黑名單
    this.logger.log(`用戶登出: ${req.user.email}`);
    
    return {
      success: true,
      message: '登出成功',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    try {
      const user = await this.authService.getUserProfile(req.user.id);
      
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`獲取用戶資料失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateData: any) {
    try {
      const user = await this.authService.updateUserProfile(req.user.id, updateData);
      this.logger.log(`用戶資料更新: ${req.user.email}`);
      
      return {
        success: true,
        message: '資料更新成功',
        data: user,
      };
    } catch (error) {
      this.logger.error(`更新用戶資料失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    try {
      await this.authService.changePassword(req.user.id, changePasswordDto);
      this.logger.log(`用戶密碼更改: ${req.user.email}`);
      
      return {
        success: true,
        message: '密碼更改成功',
      };
    } catch (error) {
      this.logger.error(`密碼更改失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.authService.forgotPassword(forgotPasswordDto);
      this.logger.log(`密碼重置請求: ${forgotPasswordDto.email}`);
      
      return {
        success: true,
        message: '密碼重置郵件已發送',
      };
    } catch (error) {
      this.logger.error(`密碼重置請求失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(resetPasswordDto);
      this.logger.log(`密碼重置完成`);
      
      return {
        success: true,
        message: '密碼重置成功',
      };
    } catch (error) {
      this.logger.error(`密碼重置失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    try {
      await this.authService.verifyEmail(body.token);
      this.logger.log(`郵箱驗證完成`);
      
      return {
        success: true,
        message: '郵箱驗證成功',
      };
    } catch (error) {
      this.logger.error(`郵箱驗證失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Request() req) {
    // 這裡應該實現獲取所有用戶的邏輯
    this.logger.log(`管理員查看用戶列表: ${req.user.email}`);
    
    return {
      success: true,
      message: '獲取用戶列表成功',
      data: [],
    };
  }
}
