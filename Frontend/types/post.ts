export interface IPost {
  _id: string; title: string; slug: string; excerpt: string; content: string; featuredImage: string;
  category: string; tags: string[]; author: string; status: "draft" | "published"; readingTime: number;
  createdAt: string; updatedAt: string; publishedAt?: string | null;
}
export type PostInput = Partial<Omit<IPost, "_id" | "tags" | "readingTime">> & { tags?: string[] | string };
export interface PostList { posts: IPost[]; total: number; page: number; pages: number }
export interface RelatedPosts { related: IPost[]; prev: Pick<IPost, "title" | "slug"> | null; next: Pick<IPost, "title" | "slug"> | null }
