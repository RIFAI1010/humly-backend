import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreateCommentDto, CreatePostDto } from './dto';
import { User } from '@prisma/client';
import { Auth } from 'src/common/decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/config/multer.config';

@Controller('posts')
@UseInterceptors(FilesInterceptor('images', 5, multerOptions)) // Maksimum 5 file
export class PostsController {
    constructor(private readonly postsservice: PostsService) { }

    @Post()
    createPost(
        @Auth() user: User,
        @Body() data: CreatePostDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        // console.log(files);
        const imagePaths = files.map((file) => `/uploads/posts/${file.filename}`);
        return this.postsservice.createPost(user.id, { ...data, images: imagePaths });
    }

    @Get('explore')
    getExplorePosts(@Query('page') page: number, @Query('limit') limit: number) {
        return this.postsservice.getExplorePosts(page, limit);
    }

    @Get('following')
    getFollowingPosts(@Auth() user: User, @Query('page') page: number, @Query('limit') limit: number) {
        return this.postsservice.getFollowingPosts(user.id, page, limit);
    }

    @Get(':id')
    getPost(@Auth() user: User, @Param('id') id: string) {
        return this.postsservice.getPost(user.id, id);
    }

    @Get(':id/user') 
    getUserPosts(@Auth() user: User, @Param('id') id: string) {
        return this.postsservice.getUserPosts(user.id, id);
    }

    @Post(':id/like')
    likePost(@Auth() user: User, @Param('id') postId: string) {
        return this.postsservice.likePost(user.id, postId);
    }
    
    @Delete(':id/like')
    unlikePost(@Auth() user: User, @Param('id') postId: string) {
        return this.postsservice.unlikePost(user.id, postId);
    }

    @Post('comment')
    createComment(@Auth() user: User, @Body() data: CreateCommentDto) {
        return this.postsservice.createComment(user.id, data);
    }

    @Get(':id/comments')
    getComments(@Auth() user: User, @Param('id') postId: string) {
        return this.postsservice.getComments(user.id, postId);
    }

    @Get('comment/:comment_id')
    getReplies(@Auth() user: User, @Param('comment_id') commentId: string) {
        return this.postsservice.getReplies(user.id, commentId);
    }
}
