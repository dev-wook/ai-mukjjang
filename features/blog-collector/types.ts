export type BlogPost = {
  title: string;
  link: string;
  description: string;
  bloggerName: string;
  postDate: string;
  content: string | null;
  crawlStatus: "success" | "failed";
};

export type BlogCollectionResult = {
  posts: BlogPost[];
  searchedCount: number;
  crawledCount: number;
};
