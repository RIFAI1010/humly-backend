import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreateCommentDto, CreatePostDto } from './dto';
import { User } from '@prisma/client';
import { Auth } from 'src/common/decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from 'src/common/config/multer.config';
import { log } from 'console';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.middleware';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsservice: PostsService) { }

    @Post()
    @UseInterceptors(FilesInterceptor('images', 5, multerOptions), FileCleanupInterceptor)
    async createPost(
        @Auth() user: User,
        @Body() data: CreatePostDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const imagePaths = files.map((file) => ({
            filename: file.filename,
            path: `${multerConfig.path}/${file.filename}`,
            originalPath: file.path
        }));

        try {
            const result = await this.postsservice.createPost(user.id, {
                ...data,
                images: imagePaths.map(img => img.path)
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    @Get()
    GetPersonalPosts(
        @Auth() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.postsservice.getPersonalPosts(
            user.id, parseInt(page as any), 
            parseInt(limit as any));
    }

    @Delete(':id')
    deletePersonalPosts(@Auth() user: User, @Param('id') id: string) {
        return this.postsservice.deletePersonalPosts(user.id, id);
    }

    @Put(':id')
    editPersonalPosts(
        @Auth() user: User,
        @Body() data: CreatePostDto,
        @Param('id') id: string
    ) {
        return this.postsservice.editPersonalPosts(user.id, id, data);
    }

    @Get('liked')
    GetLikedPosts(
        @Auth() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.postsservice.getLikedPosts(user.id, 
            parseInt(page as any), 
            parseInt(limit as any));
    }

    @Get('explore')
    getExplorePosts(
        @Auth() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.postsservice.getExplorePosts(user.id, parseInt(page as any), parseInt(limit as any));
    }

    @Get('following')
    getFollowingPosts(
        @Auth() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.postsservice.getFollowingPosts(user.id, parseInt(page as any), parseInt(limit as any));
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
    createComment(@Auth() user: User, @Body() 
    data: CreateCommentDto) {
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
