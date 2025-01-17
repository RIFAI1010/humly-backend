import { Controller, Get, Param, Put, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
// import { User } from 'src/common/decorators/user.decorator';
import { User } from '@prisma/client';
import { Auth } from 'src/common/decorators/user.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    getProfile(@Auth() user: User) {
        // // return this.usersService.getProfile(userId);
        // if (!user || !user.id) {
        //     throw new UnauthorizedException('User not authenticated');
        // }
        return this.usersService.getMyProfile(user.id);
    }

    @Get('user/:id')
    getUser(@Auth() user: User, @Param('id') id: string) {
        return this.usersService.getProfile(user.id, id);
    }

    
    @Put('/edit')
    editProfile(@Auth() user: User, @Req() req: Request) {
        return this.usersService.editProfile(user.id, req.body);
    }

    @Get('search/:term')
    search(@Param('term') term: string) {
        return this.usersService.search(term);
    }
}
