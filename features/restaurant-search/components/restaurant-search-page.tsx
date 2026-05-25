"use client";

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Flame,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Utensils
} from "lucide-react";
import { requestRestaurantSearch } from "@/features/restaurant-search/api/search-client";
import type {
  RestaurantSearchItem,
  TrustBadge
} from "@/features/restaurant-search/types";

const EXAMPLE_QUERIES = [
  "영등포 맛집",
  "성수 삼겹살",
  "강남 회식 맛집",
  "홍대 데이트 맛집"
];

const badgeStyles: Record<TrustBadge, string> = {
  "찐후기 가능성 높음": "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "내돈내산 추정": "border-orange-400/30 bg-orange-400/10 text-orange-100",
  "협찬 의심": "border-amber-400/30 bg-amber-400/10 text-amber-100",
  "광고성 문구 많음": "border-rose-400/30 bg-rose-400/10 text-rose-100",
  "후기 품질 높음": "border-sky-400/30 bg-sky-400/10 text-sky-100",
  "판단 보류": "border-zinc-500/30 bg-zinc-500/10 text-zinc-200"
};

const EMPTY_ANALYSIS_ITEMS = [
  "광고/협찬 의심 후기 분류",
  "내돈내산 가능성 분석",
  "대표 메뉴와 분위기 요약",
  "웨이팅·재방문 언급 체크",
  "후기 신뢰도 기반 정리"
];

export function RestaurantSearchPage() {
  const [query, setQuery] = useState("영등포 맛집");
  const [items, setItems] = useState<RestaurantSearchItem[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasResults = items.length > 0;
  const pickItem = hasResults
    ? items.reduce((highestItem, item) =>
        item.confidenceScore > highestItem.confidenceScore ? item : highestItem
      )
    : null;
  const resultLabel = searchedQuery
    ? `"${searchedQuery}" 기준 ${items.length}개 결과`
    : "먹짱이 광고 냄새와 찐후기 신호를 함께 살펴봅니다.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setErrorMessage("검색어는 2자 이상 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await requestRestaurantSearch({ query: trimmedQuery });
      setItems(response.items);
      setSearchedQuery(response.query);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "검색 중 문제가 발생했습니다."
      );
      setItems([]);
      setSearchedQuery("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-1 flex-col justify-center gap-8 py-6">
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <MukjjangLogo />
            <div>
              <p className="text-lg font-black text-zinc-50">mukjjang</p>
              <p className="text-sm font-medium text-orange-200">
                광고 걸러주는 AI 맛집 탐정
              </p>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-normal text-zinc-50 sm:text-5xl">
            오늘 뭐 먹지 고민될 때, 먹짱
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            동네와 메뉴만 입력하면 먹짱이 블로그 후기를 살펴보고 광고성 신호는
            덜어낸 뒤, 지금 가볼 만한 맛집과 대표 메뉴를 빠르게 골라드려요.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 shadow-orange-glow"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="restaurant-query">
              맛집 검색어
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                id="restaurant-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="예: 영등포 맛집"
                className="h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-12 text-base text-zinc-50 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-orange-500 px-5 text-sm font-bold text-zinc-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              찐맛집 찾기
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((exampleQuery) => (
              <button
                key={exampleQuery}
                type="button"
                onClick={() => setQuery(exampleQuery)}
                className="rounded-full border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-orange-400/60 hover:text-orange-100"
              >
                {exampleQuery}
              </button>
            ))}
          </div>
        </form>

        <section aria-live="polite">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-100">분석 결과</h2>
            <p className="text-sm text-zinc-400">{resultLabel}</p>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          {!errorMessage && !hasResults ? (
            <div className="rounded-lg border border-dashed border-orange-400/20 bg-zinc-950/70 p-5 text-sm text-zinc-300">
              <div className="mb-4 flex items-center gap-2 text-base font-bold text-zinc-100">
                <Flame className="h-5 w-5 text-orange-300" />
                이런 분석을 해드려요
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {EMPTY_ANALYSIS_ITEMS.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-md bg-zinc-900/80 px-3 py-2"
                  >
                    <BadgeCheck className="h-4 w-4 shrink-0 text-orange-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {hasResults ? (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <RestaurantResultCard
                  item={item}
                  isPick={pickItem === item}
                  key={`${item.restaurantName}-${item.blogLink}`}
                />
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function MukjjangLogo() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-orange-400/30 bg-zinc-900 shadow-orange-glow"
    >
      <div className="absolute top-2 h-5 w-7 rounded-t-full border-x-4 border-t-4 border-orange-300" />
      <div className="absolute bottom-2 h-3 w-8 rounded-b-full border-b-4 border-orange-500" />
      <div className="absolute right-2 top-2 h-7 w-1 -rotate-12 rounded-full bg-orange-200" />
      <Search className="absolute bottom-2 right-1 h-4 w-4 text-zinc-50" />
    </div>
  );
}

function RestaurantResultCard({
  item,
  isPick
}: {
  item: RestaurantSearchItem;
  isPick: boolean;
}) {
  const primaryBadge = pickPrimaryBadge(item.badges);
  const reviewNotes = item.evidence.slice(0, 3);
  const referenceNote = buildReferenceNote(item);

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {isPick ? (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-100">
              <Flame className="h-3.5 w-3.5" />
              먹짱 Pick
            </div>
          ) : null}
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[primaryBadge]}`}
          >
            {primaryBadge}
          </span>
          <h3 className="mt-3 text-xl font-black text-zinc-50">
            {item.restaurantName}
          </h3>
          <p className="mt-1 text-sm font-medium text-orange-300">
            {item.location} · {item.category}
          </p>
        </div>
        <a
          href={item.blogLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`${item.restaurantName} 블로그 글 열기`}
          className="rounded-md border border-zinc-800 p-2 text-zinc-300 transition hover:border-orange-400/60 hover:text-orange-200"
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-4 rounded-md bg-zinc-900 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-100">
          <ShieldCheck className="h-4 w-4 text-orange-300" />
          AI 분석
        </div>
        <p className="text-sm leading-6 text-zinc-300">{item.summary}</p>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-md border border-zinc-800 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-orange-300" />
            신뢰도
          </p>
          <p className="mt-1 font-semibold text-zinc-100">
            {item.confidenceScore}점 · 후기 품질 {item.reviewQuality}
          </p>
        </div>
        <div className="rounded-md border border-zinc-800 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <Utensils className="h-3.5 w-3.5 text-orange-300" />
            대표 메뉴
          </p>
          <p className="mt-1 font-semibold text-zinc-100">
            {item.menus.length > 0 ? item.menus.join(" / ") : "메뉴 분석 중"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.badges.map((badge) => (
          <span
            key={badge}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[badge]}`}
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-4">
        <p className="text-xs font-bold text-zinc-500">후기 특징</p>
        <ul className="mt-2 space-y-1.5 text-xs leading-5 text-zinc-400">
          {reviewNotes.map((note) => (
            <li className="flex gap-2" key={note}>
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-300" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex gap-2 rounded-md border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{referenceNote}</p>
      </div>
    </article>
  );
}

function pickPrimaryBadge(badges: TrustBadge[]) {
  const priority: TrustBadge[] = [
    "찐후기 가능성 높음",
    "내돈내산 추정",
    "후기 품질 높음",
    "협찬 의심",
    "광고성 문구 많음",
    "판단 보류"
  ];

  return priority.find((badge) => badges.includes(badge)) ?? "판단 보류";
}

function buildReferenceNote(item: RestaurantSearchItem) {
  if (item.badges.includes("광고성 문구 많음")) {
    return "광고성 표현이 여러 번 보여 방문 전 다른 후기와 함께 비교해 보세요.";
  }

  if (item.badges.includes("협찬 의심")) {
    return "협찬 가능성이 보여 실제 방문 후기 비중을 함께 확인하는 편이 좋습니다.";
  }

  if (item.badges.includes("판단 보류")) {
    return "후기 근거가 충분하지 않아 추가 확인 후 방문을 추천합니다.";
  }

  return `먹짱이 ${item.sourceBlogCount}개 후기 근거를 바탕으로 정리했습니다.`;
}
