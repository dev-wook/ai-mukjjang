import type { BlogPost } from "@/features/blog-collector/types";
import type {
  AnalysisMode,
  RestaurantSearchItem,
  TrustBadge
} from "@/features/restaurant-search/types";
import type { ReviewAnalysis } from "@/features/review-analysis/types";
import {
  analyzeRestaurantReviewsWithGemini,
  hasGeminiConfig
} from "@/lib/gemini";

export async function analyzeReviews(
  query: string,
  blogPosts: BlogPost[]
): Promise<{ analysisMode: AnalysisMode; items: RestaurantSearchItem[] }> {
  if (!hasGeminiConfig()) {
    return {
      analysisMode: "mock",
      items: buildMockAnalysis(query, blogPosts)
    };
  }

  const analyses = await analyzeRestaurantReviewsWithGemini(query, blogPosts);

  return {
    analysisMode: "gemini",
    items: analyses.map((analysis) => toRestaurantSearchItem(analysis, blogPosts))
  };
}

function buildMockAnalysis(
  query: string,
  blogPosts: BlogPost[]
): RestaurantSearchItem[] {
  const normalizedQuery = query.replace(/\s+/g, " ").trim();
  const location = inferLocation(normalizedQuery);
  const category = inferCategory(normalizedQuery);

  return [
    {
      restaurantName: `${location} 김치삼겹`,
      location,
      category,
      badges: ["찐후기 가능성 높음", "내돈내산 추정", "후기 품질 높음"],
      reviewQuality: "높음",
      confidenceScore: 84,
      summary:
        "여러 후기에서 웨이팅, 고기 품질, 김치찌개 구성이 반복적으로 언급되어 방문 만족도가 높은 편으로 추정됩니다.",
      menus:
        category === "회식"
          ? ["생삼겹살", "김치찌개", "모둠구이"]
          : ["생삼겹살", "김치찌개"],
      blogLink: blogPosts[0]?.link ?? "",
      sourceBlogCount: blogPosts.length,
      evidence: [
        "직접 결제 또는 방문 맥락이 있는 문장이 포함됨",
        "메뉴와 대기 정보처럼 구체적인 경험 정보가 있음",
        "협찬/제공 표기가 mock 데이터에는 발견되지 않음"
      ]
    }
  ];
}

function toRestaurantSearchItem(
  analysis: ReviewAnalysis,
  blogPosts: BlogPost[]
): RestaurantSearchItem {
  const blogLink = analysis.sourceBlogLinks[0] ?? blogPosts[0]?.link ?? "";

  return {
    restaurantName: analysis.restaurantName,
    location: analysis.location,
    category: analysis.category,
    badges: buildBadges(analysis),
    reviewQuality: toReviewQualityLabel(analysis.reviewQuality),
    confidenceScore: Math.round(analysis.confidenceScore),
    summary: analysis.summary,
    menus: analysis.menus,
    blogLink,
    sourceBlogCount: analysis.sourceBlogLinks.length || blogPosts.length,
    evidence: analysis.evidence
  };
}

function buildBadges(analysis: ReviewAnalysis): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (analysis.trustLabel === "high") {
    badges.push("찐후기 가능성 높음");
  }

  if (analysis.isOwnExpenseLikely) {
    badges.push("내돈내산 추정");
  }

  if (analysis.isSponsoredSuspected) {
    badges.push("협찬 의심");
  }

  if (analysis.isAdLikely) {
    badges.push("광고성 문구 많음");
  }

  if (analysis.reviewQuality === "high") {
    badges.push("후기 품질 높음");
  }

  if (badges.length === 0) {
    badges.push("판단 보류");
  }

  return badges;
}

function toReviewQualityLabel(value: ReviewAnalysis["reviewQuality"]) {
  if (value === "high") {
    return "높음";
  }

  if (value === "low") {
    return "낮음";
  }

  return "보통";
}

function inferLocation(query: string) {
  return query.split(" ")[0] || "지역";
}

function inferCategory(query: string) {
  if (query.includes("삼겹살")) {
    return "삼겹살";
  }

  if (query.includes("회식")) {
    return "회식";
  }

  return "한식";
}
