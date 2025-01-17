import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    bio: string;
}
