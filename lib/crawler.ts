import * as cheerio from "cheerio";

export type CrawlResult = {
  url: string;
  content: string;
};

export async function crawlBlogContent(url: string): Promise<CrawlResult | null> {
  try {
    const normalizedUrl = normalizeNaverBlogUrl(url);
    const html = await fetchHtml(normalizedUrl);
    const iframeUrl = extractMainFrameUrl(html, normalizedUrl);
    const contentHtml = iframeUrl ? await fetchHtml(iframeUrl) : html;
    const content = extractReadableText(contentHtml);

    if (!content) {
      return null;
    }

    return {
      url: iframeUrl ?? normalizedUrl,
      content
    };
  } catch {
    return null;
  }
}

function normalizeNaverBlogUrl(url: string) {
  return url.replace("m.blog.naver.com", "blog.naver.com");
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AiMukjjangBot/0.1; +https://ai-mukjjang.local)"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("블로그 본문 요청에 실패했습니다.");
  }

  return response.text();
}

function extractMainFrameUrl(html: string, baseUrl: string) {
  const $ = cheerio.load(html);
  const frameSrc = $("#mainFrame").attr("src");

  if (!frameSrc) {
    return null;
  }

  return new URL(frameSrc, baseUrl).toString();
}

function extractReadableText(html: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe").remove();

  const text =
    $(".se-main-container").text() ||
    $("#postViewArea").text() ||
    $(".post_view").text() ||
    $("body").text();

  return text.replace(/\s+/g, " ").trim().slice(0, 6000);
}
