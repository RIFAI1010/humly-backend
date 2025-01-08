import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
    content: string;
    status: string;
    

}
