import type {
  RestaurantSearchRequest,
  RestaurantSearchResponse
} from "@/features/restaurant-search/types";

type ApiErrorResponse = {
  message?: string;
};

export async function requestRestaurantSearch(
  payload: RestaurantSearchRequest
): Promise<RestaurantSearchResponse> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(errorBody.message ?? "검색 중 문제가 발생했습니다.");
  }

  return (await response.json()) as RestaurantSearchResponse;
}
