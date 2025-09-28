import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: '當前密碼必須是字符串' })
  @MinLength(1, { message: '當前密碼不能為空' })
  currentPassword: string;

  @IsString({ message: '新密碼必須是字符串' })
  @MinLength(8, { message: '新密碼至少需要8個字符' })
  @MaxLength(128, { message: '新密碼不能超過128個字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '新密碼必須包含至少一個小寫字母、一個大寫字母、一個數字和一個特殊字符',
  })
  newPassword: string;
}
