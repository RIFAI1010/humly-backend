import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { removeFiles } from 'src/common/config/multer.config';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getMyProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                userDetails: true,
                _count: {
                    select: {
                        follower: true,  // Menghitung jumlah follower
                        following: true  // Menghitung jumlah following
                    }
                }
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            userDetails: user.userDetails,
            followerCount: user._count.follower,  // Mengubah menjadi followerCount
            followingCount: user._count.following // Mengubah menjadi followingCount
        };
    }


    async getProfile(userId: string, id: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                username: true,
                email: true,
                userDetails: true,
                _count: {
                    select: {
                        follower: true,  // Menghitung jumlah follower
                        following: true  // Menghitung jumlah following
                    }
                }
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

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            userDetails: user.userDetails,
            followerCount: user._count.follower,  // Mengubah menjadi followerCount
            followingCount: user._count.following // Mengubah menjadi followingCount
        };
    }

    async editProfile(userId: string, data: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { userDetails: true },
        })
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const username = await this.prisma.user.findFirst({
            where: {
                username: data.username,
                NOT: { id: userId },
            }
        })
        if (username) {
            throw new BadRequestException('Username is already taken');
        }
        if (user.userDetails.image && data.profileImage) {
            await removeFiles([user.userDetails.image]);
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                username: data.username,
                userDetails: {
                    update: {
                        name: data.name,
                        bio: data.bio,
                        image: data.profileImage || user.userDetails.image
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

    // user.service.ts
    search(id: any) {
        return this.prisma.user.findMany({
            where: { id: id },
            select: {
                id: true,
                username: true,
                email: true,
                userDetails: true,
                _count: {
                    select: {
                        follower: true, 
                        following: true 
                    }
                }
            },
        });
    }

}
