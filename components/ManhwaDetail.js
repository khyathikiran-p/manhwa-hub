"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./ManhwaDetail.module.css";

function formatDate(dateObj) {
  if (!dateObj) return "Unknown";
  const { year, month, day } = dateObj;
  const parts = [];
  if (month) parts.push(new Date(2000, month - 1).toLocaleString("en", { month: "short" }));
  if (day) parts.push(day);
  if (year) parts.push(year);
  return parts.join(" ") || "Unknown";
}

function formatStatus(s) {
  switch (s) {
    case "RELEASING": return "Ongoing";
    case "FINISHED": return "Completed";
    case "HIATUS": return "Hiatus";
    case "NOT_YET_RELEASED": return "Upcoming";
    case "CANCELLED": return "Cancelled";
    default: return s || "Unknown";
  }
}

export default function ManhwaDetail({ manhwa }) {
  if (!manhwa) return null;

  const title = manhwa.title?.english || manhwa.title?.romaji || "Unknown";
  const altTitle = manhwa.title?.romaji !== title ? manhwa.title?.romaji : manhwa.title?.native;
  const cover = manhwa.coverImage?.extraLarge || manhwa.coverImage?.large;
  const banner = manhwa.bannerImage;
  const score = manhwa.averageScore;
  const genres = manhwa.genres || [];
  const tags = (manhwa.tags || []).filter(t => t.rank >= 40).slice(0, 15);
  const chars = manhwa.characters?.nodes || [];
  const recs = (manhwa.recommendations?.nodes || [])
    .map(n => n.mediaRecommendation)
    .filter(Boolean);

  return (
    <motion.div
      className={styles.detailPage}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22, mass: 0.8 }}
    >
      {/* Banner */}
      <div className={styles.banner}>
        {banner ? (
          <img src={banner} alt="" className={styles.bannerImg} />
        ) : (
          <div className={styles.bannerFallback} />
        )}
        <div className={styles.bannerGradient} />
      </div>

      {/* Main Content */}
      <div className={styles.main}>
        <Link href="/browse" className={styles.backLink}>
          ← Back to Browse
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.coverWrapper}>
            {cover && (
              <img src={cover} alt={title} className={styles.cover} />
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.titleMain}>{title}</h1>
            {altTitle && <p className={styles.titleAlt}>{altTitle}</p>}
            <div className={styles.metaRow}>
              {score && (
                <span className={styles.scoreLarge}>⭐ {score}%</span>
              )}
              <span className={styles.metaItem}>
                📊 #{manhwa.popularity?.toLocaleString()} popularity
              </span>
              <span className={styles.metaItem}>
                ❤️ {manhwa.favourites?.toLocaleString()} favorites
              </span>
              {manhwa.chapters && (
                <span className={styles.metaItem}>
                  📚 {manhwa.chapters} chapters
                </span>
              )}
            </div>
            <div className={styles.genresRow}>
              {genres.map(g => (
                <span key={g} className="chip">{g}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Left: Description + Tags + Characters + Recommendations */}
          <div className={styles.descSection}>
            {/* Synopsis */}
            <div>
              <h2 className={styles.sectionLabel}>📝 Synopsis</h2>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: manhwa.description || "<p>No synopsis available.</p>" }}
              />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h2 className={styles.sectionLabel}>🏷️ Tags</h2>
                <div className={styles.tagsGrid}>
                  {tags.map(t => (
                    <span key={t.name} className={styles.tagChip} title={t.description}>
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Characters */}
            {chars.length > 0 && (
              <div>
                <h2 className={styles.sectionLabel}>👥 Characters</h2>
                <div className={styles.charsGrid}>
                  {chars.map(c => (
                    <div key={c.id} className={styles.charCard}>
                      {c.image?.medium && (
                        <img
                          src={c.image.medium}
                          alt={c.name?.full}
                          className={styles.charImg}
                          loading="lazy"
                        />
                      )}
                      <p className={styles.charName}>{c.name?.full}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recs.length > 0 && (
              <div>
                <h2 className={styles.sectionLabel}>💡 Recommendations</h2>
                <div className={styles.recsGrid}>
                  {recs.map(r => (
                    <Link
                      key={r.id}
                      href={`/manhwa/${r.id}`}
                      className={styles.recCard}
                    >
                      {r.coverImage?.large && (
                        <img
                          src={r.coverImage.large}
                          alt={r.title?.english || r.title?.romaji}
                          className={styles.recImg}
                          loading="lazy"
                        />
                      )}
                      <div className={styles.recInfo}>
                        <p className={styles.recTitle}>
                          {r.title?.english || r.title?.romaji}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Info Card */}
          <div className={styles.sideInfo}>
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status</span>
                <span className={styles.infoValue}>{formatStatus(manhwa.status)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Format</span>
                <span className={styles.infoValue}>{manhwa.format || "Manhwa"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Chapters</span>
                <span className={styles.infoValue}>{manhwa.chapters || "—"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Volumes</span>
                <span className={styles.infoValue}>{manhwa.volumes || "—"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Start Date</span>
                <span className={styles.infoValue}>{formatDate(manhwa.startDate)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>End Date</span>
                <span className={styles.infoValue}>{formatDate(manhwa.endDate)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Source</span>
                <span className={styles.infoValue}>{manhwa.source || "—"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Country</span>
                <span className={styles.infoValue}>{manhwa.countryOfOrigin || "KR"}</span>
              </div>
              {manhwa.meanScore && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Mean Score</span>
                  <span className={styles.infoValue}>{manhwa.meanScore}%</span>
                </div>
              )}
            </div>

            {/* Synonyms */}
            {manhwa.synonyms?.length > 0 && (
              <div className={styles.infoCard}>
                <h3 className={styles.sectionLabel}>Also Known As</h3>
                {manhwa.synonyms.map((s, i) => (
                  <div key={i} className={styles.infoRow}>
                    <span className={styles.infoValue} style={{ fontSize: "0.8rem" }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
