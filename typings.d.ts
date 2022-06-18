import { ArchiveType } from './enums';
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
  slug: {
    current: string;
  };
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

export interface Archive {
  src: string;
  type: ArchiveType;
  width: number;
  height: number;
}