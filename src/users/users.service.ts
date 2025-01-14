import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getMyProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, userDetails: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getProfile(userId: string, id: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: { 
                id: true,
                username: true,
                email: true,
                userDetails: true
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (user.userDetails.status === 'private' && userId !== user.id) {
            const follow = await this.prisma.follow.findFirst({
                where: {
                    followerId: userId,
                    followedId: user.id,
                }
            })
            if (!follow) {
                throw new ForbiddenException('User is Private');
            }
        }
        return user;
    }

    search(term: string) {
        return this.prisma.user.findMany({
            where: { username: { contains: term } },
        });
    }
}
