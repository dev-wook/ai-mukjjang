import { collectBlogPosts } from "@/features/blog-collector/server/blog-collector-service";
import { analyzeReviews } from "@/features/review-analysis/server/review-analysis-service";
import type {
  RestaurantSearchRequest,
  RestaurantSearchResponse
} from "@/features/restaurant-search/types";

export async function searchRestaurants(
  request: RestaurantSearchRequest
): Promise<RestaurantSearchResponse> {
  const collection = await collectBlogPosts(request.query);
  const analysis = await analyzeReviews(request.query, collection.posts);

  return {
    query: request.query,
    analysisMode: analysis.analysisMode,
    searchedBlogCount: collection.searchedCount,
    crawledBlogCount: collection.crawledCount,
    items: analysis.items
  };
}
