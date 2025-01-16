import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEmpty, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
    @IsString()
    content: string;

    // @IsString()
    // @IsNotEmpty()
    // @IsIn(['public', 'archive'])
    // status: string;
    
    // @IsArray()
    @IsOptional()
    @Type(() => String)
    images?: string[];

}
