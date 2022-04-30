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
  comment: [{ author: string, comment: string }];
}

export interface BlogComment {
  _id: string;
  author: string;
  email: string;
  comment: string;
}