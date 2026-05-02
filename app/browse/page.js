"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchManhwaList } from "@/lib/anilist";
import { useDebounce } from "@/hooks/useDebounce";
import FilterSidebar from "@/components/FilterSidebar";
import SortBar from "@/components/SortBar";
import ManhwaGrid from "@/components/ManhwaGrid";
import Pagination from "@/components/Pagination";
import styles from "./browse.module.css";

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse initial state from URL
  const initialGenres = searchParams.get("genres")
    ? searchParams.get("genres").split(",")
    : [];
  const initialTags = searchParams.get("tags")
    ? searchParams.get("tags").split(",")
    : [];
  const initialStatus = searchParams.get("status") || null;
  const initialSort = searchParams.get("sort") || "POPULARITY_DESC";
  const initialSearch = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [genres, setGenres] = useState(initialGenres);
  const [tags, setTags] = useState(initialTags);
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  const [manhwas, setManhwas] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  // Update URL when filters change
  const updateUrl = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();
      const g = newFilters.genres ?? genres;
      const t = newFilters.tags ?? tags;
      const s = newFilters.status ?? status;
      const so = newFilters.sort ?? sort;
      const se = newFilters.search ?? debouncedSearch;
      const p = newFilters.page ?? page;

      if (g.length > 0) params.set("genres", g.join(","));
      if (t.length > 0) params.set("tags", t.join(","));
      if (s) params.set("status", s);
      if (so !== "POPULARITY_DESC") params.set("sort", so);
      if (se) params.set("search", se);
      if (p > 1) params.set("page", p.toString());

      const qs = params.toString();
      router.replace(`/browse${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [genres, tags, status, sort, debouncedSearch, page, router]
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchManhwaList({
        page,
        perPage: 24,
        genres,
        tags,
        status,
        sort,
        search: debouncedSearch,
      });
      setManhwas(result.media);
      setPageInfo(result.pageInfo);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load manhwa. Please try again.");
      setManhwas([]);
    } finally {
      setLoading(false);
    }
  }, [page, genres, tags, status, sort, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page on filter changes
  const handleGenreChange = (newGenres) => {
    setGenres(newGenres);
    setPage(1);
    updateUrl({ genres: newGenres, page: 1 });
  };

  const handleTagChange = (newTags) => {
    setTags(newTags);
    setPage(1);
    updateUrl({ tags: newTags, page: 1 });
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
    updateUrl({ status: newStatus, page: 1 });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    updateUrl({ sort: newSort, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrl({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = () => {
    setGenres([]);
    setTags([]);
    setStatus(null);
    setPage(1);
    updateUrl({ genres: [], tags: [], status: null, page: 1 });
  };

  return (
    <div className={styles.browsePage}>
      <div className={styles.browseHeader}>
        <h1 className={styles.browseTitle}>
          Browse <span>Manhwa</span>
        </h1>
        <p className={styles.browseSubtitle}>
          Discover thousands of Korean webtoons — filter by genre, tropes, and more
        </p>
      </div>

      <div className={styles.browseLayout}>
        <FilterSidebar
          selectedGenres={genres}
          selectedTags={tags}
          selectedStatus={status}
          onGenreChange={handleGenreChange}
          onTagChange={handleTagChange}
          onStatusChange={handleStatusChange}
          onClearAll={handleClearAll}
        />

        <div className={styles.mainContent}>
          <SortBar
            sort={sort}
            onSortChange={handleSortChange}
            total={pageInfo?.total || 0}
            selectedGenres={genres}
            selectedTags={tags}
            selectedStatus={status}
            onRemoveGenre={(g) =>
              handleGenreChange(genres.filter((x) => x !== g))
            }
            onRemoveTag={(t) =>
              handleTagChange(tags.filter((x) => x !== t))
            }
            onClearStatus={() => handleStatusChange(null)}
          />

          <ManhwaGrid
            manhwas={manhwas}
            loading={loading}
            error={error}
            onRetry={fetchData}
          />

          <Pagination
            currentPage={page}
            lastPage={pageInfo?.lastPage || 1}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.browsePage}>
          <div className={styles.browseHeader}>
            <h1 className={styles.browseTitle}>
              Browse <span>Manhwa</span>
            </h1>
          </div>
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
