export type TrustBadge =
  | "찐후기 가능성 높음"
  | "내돈내산 추정"
  | "협찬 의심"
  | "광고성 문구 많음"
  | "후기 품질 높음"
  | "판단 보류";

export type AnalysisMode = "mock" | "gemini";

export type RestaurantSearchItem = {
  restaurantName: string;
  location: string;
  category: string;
  badges: TrustBadge[];
  reviewQuality: "높음" | "보통" | "낮음";
  confidenceScore: number;
  summary: string;
  menus: string[];
  blogLink: string;
  sourceBlogCount: number;
  evidence: string[];
};

export type RestaurantSearchRequest = {
  query: string;
};

export type RestaurantSearchResponse = {
  query: string;
  analysisMode: AnalysisMode;
  searchedBlogCount: number;
  crawledBlogCount: number;
  items: RestaurantSearchItem[];
};
