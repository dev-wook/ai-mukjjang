import type { BlogCollectionResult, BlogPost } from "@/features/blog-collector/types";
import { crawlBlogContent } from "@/lib/crawler";
import { hasNaverSearchConfig, searchNaverBlogPosts } from "@/lib/naver";

const DEFAULT_BLOG_SEARCH_LIMIT = 10;
const MAX_BLOG_SEARCH_LIMIT = 30;

const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    title: "영등포 김치삼겹 웨이팅 후기",
    link: "https://blog.naver.com/mock/youngdeungpo-kimchi-samgyeop",
    description: "영등포역 근처 삼겹살집 방문 후기와 메뉴 정리",
    bloggerName: "맛집기록",
    postDate: "20260518",
    content:
      "직접 결제하고 방문했습니다. 웨이팅은 있었지만 생삼겹살과 김치찌개 구성이 좋았고 재방문 의사가 있습니다.",
    crawlStatus: "success"
  },
  {
    title: "성수 직화삼겹 솔직 방문기",
    link: "https://blog.naver.com/mock/seongsu-samgyeop",
    description: "성수동 삼겹살집 좌석, 메뉴, 가격대 후기",
    bloggerName: "퇴근후한끼",
    postDate: "20260512",
    content:
      "협찬 문구 없이 평일 저녁 방문 후기입니다. 고기 굽기와 반찬 구성이 안정적이고 직원 응대가 빠른 편입니다.",
    crawlStatus: "success"
  }
];

export async function collectBlogPosts(
  query: string
): Promise<BlogCollectionResult> {
  if (!hasNaverSearchConfig()) {
    return {
      posts: MOCK_BLOG_POSTS,
      searchedCount: MOCK_BLOG_POSTS.length,
      crawledCount: MOCK_BLOG_POSTS.length
    };
  }

  const searchItems = await searchNaverBlogPosts(query, getBlogSearchLimit());
  const posts = await Promise.all(
    searchItems.map(async (item): Promise<BlogPost> => {
      const crawlResult = await crawlBlogContent(item.link);

      return {
        title: item.title,
        link: item.link,
        description: item.description,
        bloggerName: item.bloggername,
        postDate: item.postdate,
        content: crawlResult?.content ?? null,
        crawlStatus: crawlResult ? "success" : "failed"
      };
    })
  );

  return {
    posts,
    searchedCount: searchItems.length,
    crawledCount: posts.filter((post) => post.crawlStatus === "success").length
  };
}

function getBlogSearchLimit() {
  const parsedLimit = Number(process.env.BLOG_SEARCH_LIMIT);

  if (!Number.isFinite(parsedLimit)) {
    return DEFAULT_BLOG_SEARCH_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(parsedLimit), 1), MAX_BLOG_SEARCH_LIMIT);
}
