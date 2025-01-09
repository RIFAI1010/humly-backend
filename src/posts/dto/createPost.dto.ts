import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
    @IsString()
    content: string;

    @IsString()
    @IsIn(['public', 'archive'])
    status: string;
    
    // @IsArray()
    @Type(() => String)
    images?: string[];

}
