const API_URL = "https://graphql.anilist.co";

async function fetchAniList(query, variables) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // Cache for 5 min in Next.js
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
    media: data.Page.media,
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
  return data.Page.media;
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
