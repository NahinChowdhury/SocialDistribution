export interface AuthorInterface {
    type: 'author',
    created: string;
    displayName: string;
    github: string;
    id: string;
    is_active: boolean;
    profilePicture: string;
    updated: string;
    url: string;
    followed?: boolean;
    following?: "Following" | "Not Following" | "Pending";
    isFriends?: boolean;
    isFollowed?: boolean;
    isFollowing?: boolean;
    profileImage?: string;
}

export interface PostInterface {
    type: 'post',
    id: string;
    title: string;
    source: string;
    origin: string;
    description: string;
    contentType: string;
    author: AuthorInterface;
    categories: string;
    count: number;
    comments: string;
    content: string;
    published: string;
    visibility: string;
    specific_author?: AuthorInterface | null;
    unlisted: boolean;
    likes: LikeInterface[];
    showComments: boolean;
    image?: string;
    imageObject?: File | null;
}

export interface CommentInterface {
    type: 'comment';
    author: AuthorInterface;
    comment: string;
    contentType: string;
    id: string;
    details: string;
    published: string;
    likes: LikeInterface[];
    post?: string;
}

export interface LikeInterface {
    type: 'Like',
    author: AuthorInterface;
    post: string;
    comment: string;
}

export interface UserProfileInterface {
    id: string;
    displayName: string;
    github: string;
    profilePictureURL: string;
    profilePicture?: File | null;
}

export interface FollowRequestInterface {
    type: 'Follow',
    actor: AuthorInterface;
    object: AuthorInterface;
    summary: string;
}