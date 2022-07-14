import { MediaType } from './enums';
export interface Post {
  _id: string;
  _createdAt: string;
  title: string;
  author: {
    name: string;
    image: string;
  };
  description: string;
  mainImage: {
    asset: {
      url: string;
    };
  };
  slug: Slug;
  body: object[];
  comment: Comment[];
}

export interface BlogComment {
  _id: string;
  author: string;
  comment: string;
}

export interface Email {
  email: string;
}

export interface EmailCode {
  email: string;
  code: string;
}

export interface Comment {
  author: string;
  comment: string;
}

export interface Media {
  src: string;
  mediaSrc: string;
  type: MediaType;
  height: number;
  width: number;
}

export interface LinkToAdd {
  slug: string;
  link: string;
}

export interface ImageCategory {
  title: string;
  nsfw: boolean;
}

export interface ImageCategoryRes extends ImageCategory {
  slug: Slug;
}

export interface Slug {
  current: string;
  _type: string;
}