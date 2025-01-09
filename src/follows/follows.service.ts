import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class FollowsService {
    constructor(private readonly prisma: PrismaService) { }

    async follow(followerId: string, followedId: string) {
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followedId: {
                    followerId,
                    followedId,
                },
            },
        });

        if (existingFollow) {
            throw new BadRequestException('Already following this user');
        }

        const follow = await this.prisma.follow.create({
            data: {
                followerId,
                followedId,
            },
        });
        // return follow;
        return { message: 'Follow successful' };
    }

    async unFollow(followerId: string, followedId: string) {
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followedId: {
                    followerId,
                    followedId,
                },
            },
        });

        if(!existingFollow) {
            throw new BadRequestException('Not following this user');
        }

        const unFollow = await this.prisma.follow.delete({
            where: {
                followerId_followedId: {
                    followerId,
                    followedId,
                },
            },
        });

        return { message: 'Unfollow successful' };
    }

    async followers(userId: string) {
        const followers = await this.prisma.follow.findMany({
            where: {
                followedId: userId,
            },
            select: {
                followerId: true,
            },
        });
        return followers;
    }

    async followings(userId: string) {
        const followings = await this.prisma.follow.findMany({
            where: {
                followerId: userId,
            },
            select: {
                followedId: true,
            },
        });
        return followings;
    }
}