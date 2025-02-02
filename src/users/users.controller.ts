import { Body, Controller, Get, Param, Put, Req, UnauthorizedException, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
// import { User } from 'src/common/decorators/user.decorator';
import { User } from '@prisma/client';
import { Auth } from 'src/common/decorators/user.decorator';
import { UpdateUserDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from 'src/common/config/multer.config';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.middleware';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    getProfile(@Auth() user: User) {
        // // return this.usersService.getProfile(userId);
        // if (!user || !user.id) {
        //     throw new UnauthorizedException('User not authenticated');
        // }
        return this.usersService.getMyProfile(user.id);
    }

    @Get(':id')
    getUser(@Auth() user: User, @Param('id') id: string) {
        return this.usersService.getProfile(user.id, id);
    }

    @Put()
    @UseInterceptors(FilesInterceptor('profileImage', 1, multerOptions), FileCleanupInterceptor)
    async editProfile(
        @Auth() user: User,
        @Body() data: UpdateUserDto,
        @UploadedFiles() files: Express.Multer.File,
    ) {
        console.log('iamge path: ', files);
        const imagePaths = files && files[0] ? {
            filename: files[0].filename,
            path: `${multerConfig.path}/${files[0].filename}`,
            originalPath: files[0].path
        } : null;

        try {
            console.log('iamge path profile: ', imagePaths);
            const result = await this.usersService.editProfile(user.id, {
                ...data,
                profileImage: imagePaths && imagePaths.path
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    @Get('search/:term')
    search(@Param('term') term: string) {
        return this.usersService.search(term);
    }


}
