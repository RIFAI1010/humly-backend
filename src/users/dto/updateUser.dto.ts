import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username tidak boleh ada spasi dan hanya boleh menggunakan huruf, angka, underscore dan hyphen',
    })
    username: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    bio: string;

    @IsOptional()
    @Type(() => String)
    profileImage?: string;
}
