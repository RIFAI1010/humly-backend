    import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
    import { PrismaService } from 'src/prisma/prisma.service';
    import { CreateCommentDto, CreatePostDto } from './dto';
    import { StatusPost } from '@prisma/client';
    import { UsersService } from 'src/users/users.service';

    @Injectable()
    export class PostsService {
        constructor(private readonly prisma: PrismaService, private readonly userService: UsersService) { }

        async createPost(userId: string, data: CreatePostDto) {
            try {
                return await this.prisma.$transaction(async (prisma) => {
                    const { content, images } = data;

                    const post = await prisma.post.create({
                        data: {
                            userId,
                            content,
                            status: 'public',
                            images: {
                                create: images.map((image: string) => ({
                                    image,
                                })),
                            },
                        },
                        include: {
                            user: true,  // Menyertakan data user yang membuat post
                            images: true, // Menyertakan data gambar yang terkait dengan post
                        },
                    });

                    return post;
                });
            } catch (error) {
                // Re-throw error untuk ditangani di controller
                throw error;
            }
        }

        async getPersonalPosts(userId: string) {
            const posts = await this.prisma.post.findMany({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    images: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                },
            });
            return posts.map(post => ({
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
            }));
        }

    async getLikedPosts(userId: string) {
        const likedPosts = await this.prisma.like.findMany({
            where: {
                userId: userId,
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                        images: true,
                        _count: {
                            select: {
                                likes: true,
                                comments: true
                            }
                        }
                    }
                }
            }
        });

        return likedPosts.map(liked => ({
            ...liked.post,
            likesCount: liked.post._count.likes,
            commentsCount: liked.post._count.comments,
        }));
    }

        async getExplorePosts(userId: string, page: number, limit: number) {
            page = page || 1;
            limit = limit || 10;
            const posts = await this.prisma.post.findMany({
                where: { status: 'public' },
                skip: (page - 1) * limit, 
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    images: true,
                    likes: {
                        select: {
                            userId: true
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });
            return posts.map(post => ({
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                isLiked: post.likes.some(like => like.userId === userId)
            }));
        }

        async getFollowingPosts(userId: string, page: number, limit: number) {
            page = page || 1;
            limit = limit || 10;
            const followedIds = await this.prisma.follow
                .findMany({
                    where: { followerId: userId },
                    select: { followedId: true },
                })
                .then((follows) => follows.map((follow) => follow.followedId));
            if (followedIds.length === 0) {
                return [];
            }
            const posts = await this.prisma.post.findMany({
                where: {
                    status: 'public',
                    userId: {
                        in: followedIds,
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    images: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                },
            });
            return posts.map(post => ({
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
            }));
        }

        async getPost(userId: string, id: string) {
            const post = await this.prisma.post.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            userDetails: true
                        },
                    },
                    images: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                },
            });
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            if (post.status === 'archive' && userId !== post.userId) {
                throw new ForbiddenException('Post Is Archive');
            }
            if (post.user.userDetails.status === 'private' && userId !== post.userId) {
                const follow = await this.prisma.follow.findFirst({
                    where: {
                        followerId: userId,
                        followedId: post.userId,
                    }
                })
                if (!follow) {
                    throw new ForbiddenException('User is Private');
                }
            }
            return {
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
            };
        }

        async getUserPosts(userId: string, id: string) {
            const user = await this.userService.getProfile(userId, id);
            const posts = await this.prisma.post.findMany({
                where: { userId: id, status: 'public' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            userDetails: true
                        },
                    },
                    images: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                },
            });

            return posts.map(post => ({
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
            }));
        }

        async likePost(userId: string, postId: string) {
            const post = await this.getPost(userId, postId);
            const like = await this.prisma.like.findFirst({
                where: {
                    userId: userId,
                    postId: postId,
                },
            });
            if (like) {
                throw new BadRequestException('Post already liked');
            }
            await this.prisma.like.create({
                data: {
                    userId: userId,
                    postId: postId,
                },
            });
            return { message: 'Post liked successfully' };
        }

        async unlikePost(userId: string, postId: string) {
            const post = await this.getPost(userId, postId);
            const like = await this.prisma.like.findFirst({
                where: {
                    userId: userId,
                    postId: postId,
                },
            });
            if (!like) {
                throw new BadRequestException('Post not liked');
            }
            await this.prisma.like.delete({
                where: {
                    id: like.id,
                },
            });
            return { message: 'Post unliked successfully' };
        }

        async createComment(userId: string, data: CreateCommentDto) {
            const { postId, content, parentId } = data;
            if (parentId) {
                const parentComment = await this.prisma.comment.findUnique({
                    where: {
                        id: parentId,
                    },
                })
                if (!parentComment) {
                    throw new NotFoundException('Parent comment not found');
                }
            }

            const post = await this.getPost(userId, postId);
            const comment = await this.prisma.comment.create({
                data: {
                    userId: userId,
                    postId: postId,
                    content: content,
                    parentId: parentId ?? null,
                },
            });
            return {
                message: 'Comment created successfully',
                comment: comment,
            };
        }

        async getComments(userId: string, postId: string) {
            const post = await this.getPost(userId, postId);
            const comments = await this.prisma.comment.findMany({
                where: {
                    postId: postId,
                    parentId: null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            userDetails: true
                        },
                    },
                    replies: {
                        take: 1,
                        orderBy: {
                            createdAt: 'desc',
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    userDetails: true
                                },
                            },
                        },
                    }
                }
            })

            return comments;
        }

        async getReplies(userId: string, commentId: string) {
            const comments = await this.prisma.comment.findFirst({
                where: {
                    id: commentId,
                },
                include: {
                    post: true,
                }
            })
            if (!comments) {
                throw new NotFoundException('Comment not found');
            }
            const post = await this.getPost(userId, comments.post.id);
            const replies = await this.prisma.comment.findMany({
                where: {
                    parentId: commentId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            userDetails: true
                        },
                    },
                }
            })
        }
    }
