import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '請提供有效的電子郵件地址' })
  email: string;

  @IsString({ message: '用戶名必須是字符串' })
  @MinLength(3, { message: '用戶名至少需要3個字符' })
  @MaxLength(50, { message: '用戶名不能超過50個字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用戶名只能包含字母、數字和下劃線' })
  username: string;

  @IsString({ message: '密碼必須是字符串' })
  @MinLength(8, { message: '密碼至少需要8個字符' })
  @MaxLength(128, { message: '密碼不能超過128個字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '密碼必須包含至少一個小寫字母、一個大寫字母、一個數字和一個特殊字符',
  })
  password: string;

  @IsString({ message: '名字必須是字符串' })
  @MinLength(1, { message: '名字不能為空' })
  @MaxLength(100, { message: '名字不能超過100個字符' })
  firstName: string;

  @IsString({ message: '姓氏必須是字符串' })
  @MinLength(1, { message: '姓氏不能為空' })
  @MaxLength(100, { message: '姓氏不能超過100個字符' })
  lastName: string;

  @IsOptional()
  @IsString({ message: '電話號碼必須是字符串' })
  @Matches(/^[0-9+\-\s()]+$/, { message: '請提供有效的電話號碼' })
  phone?: string;
}
