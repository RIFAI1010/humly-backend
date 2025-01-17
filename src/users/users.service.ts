import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

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

    async editProfile(userId: string, data: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                username: data.username,
                email: data.email,
                userDetails: {
                    update: {
                        name: data.username,
                        bio: data.bio,
                    }
                }
            }
        });
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { 
                id: true,
                username: true,
                email: true,
                userDetails: true
            },
        });
    }

    search(term: string) {
        return this.prisma.user.findMany({
            where: { username: { contains: term } },
        });
    }
}
