import { NextResponse } from "next/server";
import { searchRestaurants } from "@/features/restaurant-search/server/search-service";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 50;

type SearchRequestBody = {
  query?: unknown;
};

export async function POST(request: Request) {
  let body: SearchRequestBody;

  try {
    body = (await request.json()) as SearchRequestBody;
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { message: "검색어는 2자 이상 50자 이하로 입력해 주세요." },
      { status: 400 }
    );
  }

  const result = await searchRestaurants({ query });

  return NextResponse.json(result);
}
