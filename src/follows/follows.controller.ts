import { Controller, Param, Post, Delete, Get } from "@nestjs/common";
import { FollowsService } from "./follows.service";
import { Auth } from "src/common/decorators/user.decorator";
import { User } from "@prisma/client";


@Controller('follows')
export class FollowsController {
    constructor(private readonly postsservice: FollowsService) { }

    @Post(':id')
    follow(@Auth() user: User, @Param('id') id: string) {
        return this.postsservice.follow(user.id, id);
    }

    @Delete(':id')
    unFollow(@Auth() user: User, @Param('id') id: string) {
        return this.postsservice.unFollow(user.id, id);
    }

    @Get('followers')
    followers(@Auth() user: User) {
        return this.postsservice.followers(user.id);
    }

    @Get('followings')
    followings(@Auth() user: User) {
        return this.postsservice.followings(user.id);
    }
}