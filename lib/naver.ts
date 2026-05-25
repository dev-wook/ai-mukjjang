export type NaverBlogSearchItem = {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  postdate: string;
};

type NaverBlogSearchResponse = {
  items?: unknown;
};

const NAVER_BLOG_SEARCH_URL = "https://openapi.naver.com/v1/search/blog.json";

export function getNaverSearchConfig() {
  return {
    clientId: process.env.NAVER_CLIENT_ID ?? "",
    clientSecret: process.env.NAVER_CLIENT_SECRET ?? ""
  };
}

export function hasNaverSearchConfig() {
  const config = getNaverSearchConfig();

  return Boolean(config.clientId && config.clientSecret);
}

export async function searchNaverBlogPosts(
  query: string,
  display = 30
): Promise<NaverBlogSearchItem[]> {
  const config = getNaverSearchConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Naver Search API 환경 변수가 설정되지 않았습니다.");
  }

  const url = new URL(NAVER_BLOG_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(display));
  url.searchParams.set("sort", "sim");

  const response = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": config.clientId,
      "X-Naver-Client-Secret": config.clientSecret
    },
    next: {
      revalidate: 60 * 10
    }
  });

  if (!response.ok) {
    throw new Error("Naver Blog Search API 요청에 실패했습니다.");
  }

  const data = (await response.json()) as NaverBlogSearchResponse;

  if (!Array.isArray(data.items)) {
    return [];
  }

  return data.items
    .map(normalizeNaverBlogSearchItem)
    .filter((item): item is NaverBlogSearchItem => item !== null);
}

function normalizeNaverBlogSearchItem(item: unknown): NaverBlogSearchItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const title = readString(item.title);
  const link = readString(item.link);
  const description = readString(item.description);
  const bloggername = readString(item.bloggername);
  const postdate = readString(item.postdate);

  if (!title || !link) {
    return null;
  }

  return {
    title: stripHtml(title),
    link,
    description: stripHtml(description),
    bloggername: stripHtml(bloggername),
    postdate
  };
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
