import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Usernames must not contain spaces and must only use letters, numbers, underscores and hyphens',
  })
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
