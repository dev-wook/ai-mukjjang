import { GoogleGenAI, Type } from "@google/genai";
import type { BlogPost } from "@/features/blog-collector/types";
import type { ReviewAnalysis } from "@/features/review-analysis/types";

export const DEFAULT_GEMINI_TEXT_MODEL = "gemini-3.5-flash";
export const DEFAULT_GEMINI_FALLBACK_TEXT_MODEL = "gemini-2.5-flash";

export function getGeminiConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY ?? "",
    textModel: process.env.GEMINI_TEXT_MODEL ?? DEFAULT_GEMINI_TEXT_MODEL,
    fallbackTextModel:
      process.env.GEMINI_FALLBACK_TEXT_MODEL ?? DEFAULT_GEMINI_FALLBACK_TEXT_MODEL
  };
}

export function hasGeminiConfig() {
  return Boolean(getGeminiConfig().apiKey);
}

export async function analyzeRestaurantReviewsWithGemini(
  query: string,
  blogPosts: BlogPost[]
): Promise<ReviewAnalysis[]> {
  const config = getGeminiConfig();

  if (!config.apiKey) {
    throw new Error("Gemini API 환경 변수가 설정되지 않았습니다.");
  }

  const responseText = await generateContentWithFallback({
    apiKey: config.apiKey,
    models: [config.textModel, config.fallbackTextModel],
    contents: buildPrompt(query, blogPosts),
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          restaurants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                restaurantName: { type: Type.STRING },
                location: { type: Type.STRING },
                category: { type: Type.STRING },
                menus: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                summary: { type: Type.STRING },
                isSponsoredSuspected: { type: Type.BOOLEAN },
                isAdLikely: { type: Type.BOOLEAN },
                isOwnExpenseLikely: { type: Type.BOOLEAN },
                trustLabel: {
                  type: Type.STRING,
                  enum: ["high", "medium", "low"]
                },
                reviewQuality: {
                  type: Type.STRING,
                  enum: ["high", "medium", "low"]
                },
                confidenceScore: { type: Type.NUMBER },
                evidence: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                sourceBlogLinks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                "restaurantName",
                "location",
                "category",
                "menus",
                "summary",
                "isSponsoredSuspected",
                "isAdLikely",
                "isOwnExpenseLikely",
                "trustLabel",
                "reviewQuality",
                "confidenceScore",
                "evidence",
                "sourceBlogLinks"
              ]
            }
          }
        },
        required: ["restaurants"]
      }
    }
  });

  return normalizeGeminiAnalysisResponse(responseText);
}

async function generateContentWithFallback({
  apiKey,
  models,
  contents,
  generationConfig
}: {
  apiKey: string;
  models: string[];
  contents: string;
  generationConfig: {
    responseMimeType: string;
    responseSchema: Record<string, unknown>;
  };
}) {
  const ai = new GoogleGenAI({ apiKey });
  const uniqueModels = Array.from(new Set(models.filter(Boolean)));
  let lastError: unknown = null;

  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: generationConfig
      });

      return response.text ?? "";
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini 분석 요청에 실패했습니다.");
}

function buildPrompt(query: string, blogPosts: BlogPost[]) {
  const postsForPrompt = blogPosts
    .filter((post) => post.content)
    .map((post) => ({
      title: post.title,
      link: post.link,
      description: post.description,
      bloggerName: post.bloggerName,
      postDate: post.postDate,
      content: post.content?.slice(0, 2500)
    }));

  return [
    "너는 블로그 맛집 리뷰 신뢰도 분석가다.",
    `사용자 검색어: ${query}`,
    "아래 블로그 글들을 읽고 중복 식당은 하나로 묶어 맛집 리스트를 만든다.",
    "광고 여부를 단정하지 말고 '협찬 의심', '광고성 문구 많음', '내돈내산 추정', '판단 보류'처럼 가능성으로만 판단한다.",
    "상호명, 위치, 음식 카테고리, 대표 메뉴, 후기 요약, 리뷰 품질, 신뢰 근거를 분석한다.",
    "confidenceScore는 반드시 0부터 100 사이의 점수로 작성한다.",
    "본문에 근거가 부족하면 confidenceScore를 낮추고 evidence에 정보 부족 사유를 적는다.",
    JSON.stringify(postsForPrompt)
  ].join("\n\n");
}

function normalizeGeminiAnalysisResponse(rawText: string): ReviewAnalysis[] {
  const parsed = safeParseJson(rawText);

  if (!isRecord(parsed) || !Array.isArray(parsed.restaurants)) {
    return [];
  }

  return parsed.restaurants
    .map(normalizeReviewAnalysis)
    .filter((analysis): analysis is ReviewAnalysis => analysis !== null);
}

function normalizeReviewAnalysis(value: unknown): ReviewAnalysis | null {
  if (!isRecord(value)) {
    return null;
  }

  const restaurantName = readString(value.restaurantName);

  if (!restaurantName) {
    return null;
  }

  return {
    restaurantName,
    location: readString(value.location) || "위치 정보 부족",
    isSponsoredSuspected: readBoolean(value.isSponsoredSuspected),
    isAdLikely: readBoolean(value.isAdLikely),
    isOwnExpenseLikely: readBoolean(value.isOwnExpenseLikely),
    trustLabel: readEnum(value.trustLabel, ["high", "medium", "low"], "medium"),
    reviewQuality: readEnum(value.reviewQuality, ["high", "medium", "low"], "medium"),
    confidenceScore: normalizeConfidenceScore(value.confidenceScore),
    category: readString(value.category) || "분류 필요",
    menus: readStringArray(value.menus).slice(0, 5),
    summary: readString(value.summary) || "요약 정보가 부족합니다.",
    evidence: readStringArray(value.evidence).slice(0, 4),
    sourceBlogLinks: readStringArray(value.sourceBlogLinks)
  };
}

function safeParseJson(rawText: string): unknown {
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function readEnum<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T
) {
  return typeof value === "string" && options.includes(value as T)
    ? (value as T)
    : fallback;
}

function clampNumber(value: unknown, min: number, max: number) {
  const numberValue = typeof value === "number" ? value : min;

  return Math.min(Math.max(numberValue, min), max);
}

function normalizeConfidenceScore(value: unknown) {
  const numberValue = typeof value === "number" ? value : 0;
  const normalizedValue = numberValue > 0 && numberValue <= 5 ? numberValue * 20 : numberValue;

  return clampNumber(normalizedValue, 0, 100);
}
