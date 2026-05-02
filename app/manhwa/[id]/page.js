import { fetchManhwaDetail } from "@/lib/anilist";
import ManhwaDetail from "@/components/ManhwaDetail";

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const manhwa = await fetchManhwaDetail(id);
    const title =
      manhwa?.title?.english || manhwa?.title?.romaji || "Manhwa Detail";
    return {
      title: `${title} — ManhwaHub`,
      description:
        manhwa?.description
          ?.replace(/<[^>]*>/g, "")
          ?.substring(0, 160) || "Read more about this manhwa on ManhwaHub.",
    };
  } catch {
    return {
      title: "Manhwa Detail — ManhwaHub",
      description: "View manhwa details on ManhwaHub.",
    };
  }
}

export default async function ManhwaPage({ params }) {
  const { id } = await params;
  let manhwa = null;
  let error = null;

  try {
    manhwa = await fetchManhwaDetail(id);
  } catch (e) {
    console.error("Failed to fetch manhwa detail:", e);
    error = e.message;
  }

  if (error || !manhwa) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          paddingTop: "var(--navbar-height)",
        }}
      >
        <span style={{ fontSize: "3rem" }}>😔</span>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          Manhwa not found
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {error || "The requested manhwa could not be loaded."}
        </p>
        <a
          href="/browse"
          style={{
            padding: "10px 24px",
            background: "var(--accent-primary)",
            color: "white",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          Back to Browse
        </a>
      </div>
    );
  }

  return <ManhwaDetail manhwa={manhwa} />;
}
