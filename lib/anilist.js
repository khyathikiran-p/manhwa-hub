const API_URL = "https://graphql.anilist.co";

// 30 days. Vercel's Data Cache stores the response on its CDN edge and
// keeps serving it instantly while Next.js asynchronously revalidates on
// expiry — classic stale-while-revalidate. AniList content changes
// rarely enough that 30 days of staleness is acceptable; if we want a
// faster turnaround we can purge any tagged entry via revalidateTag().
const SWR_TTL = 60 * 60 * 24 * 30;

// Tiny non-cryptographic hash so each unique (query, variables) tuple
// gets its own cache key + tag. Lets us call revalidateTag('anilist')
// to flush everything, or revalidateTag('anilist:<hash>') for one entry.
function hashKey(query, variables) {
  const str = query + "|" + JSON.stringify(variables ?? {});
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

async function fetchAniList(query, variables) {
  const tag = `anilist:${hashKey(query, variables)}`;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    // Vercel Data Cache + Next.js fetch cache combine to give us a true
    // edge SWR: the response is shared across requests and revalidated
    // in the background after the TTL.
    next: { revalidate: SWR_TTL, tags: ["anilist", tag] },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`AniList API error ${res.status}: ${errorBody}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }
  return json.data;
}

// ─── Browse Query ───────────────────────────────────────────────
const BROWSE_QUERY = `
query (
  $page: Int,
  $perPage: Int,
  $genre_in: [String],
  $tag_in: [String],
  $status: MediaStatus,
  $sort: [MediaSort],
  $search: String,
  $country: CountryCode
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(
      type: MANGA,
      countryOfOrigin: $country,
      genre_in: $genre_in,
      tag_in: $tag_in,
      status: $status,
      sort: $sort,
      search: $search,
      isAdult: false
    ) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
        color
      }
      bannerImage
      description(asHtml: false)
      genres
      tags {
        name
        rank
      }
      averageScore
      popularity
      status
      chapters
      format
      startDate {
        year
        month
      }
    }
  }
}
`;

export async function fetchManhwaList({
  page = 1,
  perPage = 24,
  genres = [],
  tags = [],
  status = null,
  sort = "POPULARITY_DESC",
  search = "",
  country = "KR",
} = {}) {
  const variables = {
    page,
    perPage,
    sort: [sort],
    country,
  };

  if (genres.length > 0) variables.genre_in = genres;
  if (tags.length > 0) variables.tag_in = tags;
  if (status) variables.status = status;
  if (search && search.trim()) variables.search = search.trim();

  const data = await fetchAniList(BROWSE_QUERY, variables);
  return {
    // Drop entries with no usable cover — they render as blank cards on
    // the grid and as flat colored panels in the hero (visible on page
    // 5/6 of the mobile-error PDF). Cheap to filter here vs each consumer
    // having to special-case nulls.
    media: (data.Page.media || []).filter(
      (m) =>
        m &&
        (m.coverImage?.extraLarge ||
          m.coverImage?.large ||
          m.coverImage?.medium)
    ),
    pageInfo: data.Page.pageInfo,
  };
}

// ─── Lightweight Search Query (for live search dropdown) ─────────
const SEARCH_QUERY = `
query ($search: String, $country: CountryCode) {
  Page(page: 1, perPage: 8) {
    media(
      type: MANGA,
      countryOfOrigin: $country,
      search: $search,
      sort: SEARCH_MATCH,
      isAdult: false
    ) {
      id
      title {
        english
        romaji
      }
      coverImage {
        large
        color
      }
      averageScore
      genres
      format
      status
    }
  }
}
`;

export async function searchManhwa(query, { country = "KR" } = {}) {
  if (!query || !query.trim()) return [];
  const variables = { search: query.trim(), country };
  try {
    const data = await fetchAniList(SEARCH_QUERY, variables);
    return data.Page.media;
  } catch (e) {
    return [];
  }
}

// ─── Trending / Hero Query ──────────────────────────────────────
const TRENDING_QUERY = `
query {
  Page(page: 1, perPage: 8) {
    media(
      type: MANGA,
      countryOfOrigin: "KR",
      sort: TRENDING_DESC,
      isAdult: false
    ) {
      id
      title {
        english
        romaji
      }
      coverImage {
        extraLarge
        large
        color
      }
      bannerImage
      description(asHtml: false)
      genres
      averageScore
      popularity
      status
      chapters
    }
  }
}
`;

export async function fetchTrendingManhwa() {
  const data = await fetchAniList(TRENDING_QUERY, {});
  // Same cover-sanity filter as fetchManhwaList — keeps the hero rotator
  // from showing a flat themed panel for a missing AniList image.
  return (data.Page.media || []).filter(
    (m) =>
      m && (m.bannerImage || m.coverImage?.extraLarge || m.coverImage?.large)
  );
}

// ─── Detail Query ───────────────────────────────────────────────
const DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: MANGA) {
    id
    title {
      english
      romaji
      native
    }
    coverImage {
      extraLarge
      large
      color
    }
    bannerImage
    description(asHtml: true)
    genres
    tags {
      name
      rank
      description
    }
    averageScore
    meanScore
    popularity
    favourites
    status
    chapters
    volumes
    format
    source
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    countryOfOrigin
    synonyms
    characters(page: 1, perPage: 6, sort: FAVOURITES_DESC) {
      nodes {
        id
        name {
          full
        }
        image {
          medium
        }
      }
    }
    recommendations(page: 1, perPage: 8, sort: RATING_DESC) {
      nodes {
        mediaRecommendation {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
            color
          }
          averageScore
          genres
          status
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          type
          format
          status
        }
      }
    }
  }
}
`;

export async function fetchManhwaDetail(id) {
  const data = await fetchAniList(DETAIL_QUERY, { id: parseInt(id) });
  return data.Media;
}
