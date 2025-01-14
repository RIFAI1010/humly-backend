import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    postId: string;

    @IsNotEmpty()
    content: string;

    @IsNotEmpty()
    parentId: string;
    
}
