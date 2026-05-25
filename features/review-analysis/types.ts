export type ReviewAnalysis = {
  restaurantName: string;
  location: string;
  isSponsoredSuspected: boolean;
  isAdLikely: boolean;
  isOwnExpenseLikely: boolean;
  trustLabel: "high" | "medium" | "low";
  reviewQuality: "high" | "medium" | "low";
  confidenceScore: number;
  category: string;
  menus: string[];
  summary: string;
  evidence: string[];
  sourceBlogLinks: string[];
};
