import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '請提供有效的電子郵件地址' })
  email: string;

  @IsString({ message: '密碼必須是字符串' })
  @MinLength(1, { message: '密碼不能為空' })
  password: string;
}
