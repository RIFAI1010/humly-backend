import { Body, Controller, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto';
import { User } from '@prisma/client';
import { Auth } from 'src/common/decorators/user.decorator';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsservice: PostsService) { }

    @Post()
    createPost(@Auth() user: User, @Body() data: CreatePostDto) {
        return this.postsservice.createPost(data);
    }
}
