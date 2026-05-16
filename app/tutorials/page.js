"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./page.module.css";

const CHAPTERS = [
  { time: "0:00", title: "Introduction & Overview", desc: "What we're building and why it matters" },
  { time: "1:15", title: "Pick Your AI Platform", desc: "Choosing between Claude, GPT-4, and Gemini" },
  { time: "2:40", title: "Set Up Your Workspace", desc: "Tools you need — all free, all in the browser" },
  { time: "4:10", title: "Configure Your Chatbot", desc: "Write a system prompt that defines your bot's personality" },
  { time: "6:00", title: "Build the Interface", desc: "Drag-and-drop UI in under 60 seconds" },
  { time: "7:45", title: "Add Memory & Context", desc: "Make your bot remember past conversations" },
  { time: "9:00", title: "Deploy & Share", desc: "Get a public link and share it with anyone" },
  { time: "9:50", title: "Next Steps", desc: "Advanced features to explore after this tutorial" },
];

const SKILLS = [
  "Build a fully functional AI chatbot without writing a single line of code",
  "Choose the right AI model for your use case",
  "Craft effective system prompts that shape your bot's behavior",
  "Deploy your chatbot and share it via a public URL",
  "Add conversational memory so your bot feels human",
  "Customise the UI to match your brand",
];

const RELATED = [
  { title: "Add Voice to Your ChatBot", duration: "8 min", badge: "New" },
  { title: "Fine-Tune GPT on Your Own Data", duration: "15 min", badge: null },
  { title: "Build an AI Image Generator", duration: "12 min", badge: null },
  { title: "Deploy AI Apps for Free", duration: "6 min", badge: "Popular" },
];

export default function TutorialsPage() {
  const [playing, setPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.badges}>
            <span className={styles.badge}>Tutorial</span>
            <span className={styles.badgeOutline}>No Code Required</span>
          </div>
          <h1 className={styles.heroTitle}>
            Build Your Own <span className={styles.gradientText}>ChatGPT</span>
            <br />
            in <span className={styles.gradientText}>10 Minutes</span> — Zero Coding
          </h1>
          <p className={styles.heroDesc}>
            No API keys. No terminal. No frameworks. Just you, a browser, and 10 minutes.
            Follow along and you'll walk away with a working AI chatbot you can share with anyone.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>⏱ 10 min</span>
            <span className={styles.metaDot} />
            <span className={styles.metaItem}>🟢 Beginner</span>
            <span className={styles.metaDot} />
            <span className={styles.metaItem}>🆓 100% Free Tools</span>
          </div>
        </motion.div>
      </section>

      {/* ── Main Layout ───────────────────────────────────────── */}
      <div className={styles.layout}>
        {/* Left: Video + Tabs */}
        <div className={styles.main}>
          {/* Video Player */}
          <motion.div
            className={styles.playerWrapper}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.playerInner}>
              {!playing ? (
                <button
                  className={styles.playBtn}
                  onClick={() => setPlaying(true)}
                  aria-label="Play tutorial video"
                >
                  <div className={styles.playBtnBg} />
                  <div className={styles.playThumbnail}>
                    <div className={styles.thumbnailBadge}>10 MIN</div>
                    <h2 className={styles.thumbnailTitle}>
                      Build Your Own ChatGPT
                      <br />
                      <span>Zero Coding Required</span>
                    </h2>
                    <div className={styles.playIcon}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className={styles.thumbnailSub}>Click to watch the tutorial</p>
                  </div>
                </button>
              ) : (
                <div className={styles.videoEmbed}>
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                    title="Build Your Own ChatGPT in 10 Minutes — Zero Coding"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Player controls strip */}
            <div className={styles.playerControls}>
              <span className={styles.controlsTitle}>
                Build Your Own ChatGPT in 10 Minutes — Zero Coding
              </span>
              <div className={styles.controlsActions}>
                <button className={styles.controlBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Share
                </button>
                <button className={styles.controlBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
          </motion.div>

          {/* What You'll Learn */}
          <motion.section
            className={styles.learnSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <h2 className={styles.sectionTitle}>What You'll Learn</h2>
            <ul className={styles.skillsList}>
              {SKILLS.map((skill, i) => (
                <li key={i} className={styles.skillItem}>
                  <span className={styles.skillCheck}>✓</span>
                  {skill}
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Right: Chapters */}
        <motion.aside
          className={styles.sidebar}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className={styles.chaptersHeading}>Chapters</h3>
          <div className={styles.chapterList}>
            {CHAPTERS.map((ch, i) => (
              <button
                key={i}
                className={`${styles.chapterItem} ${activeChapter === i ? styles.chapterActive : ""}`}
                onClick={() => setActiveChapter(i)}
              >
                <span className={styles.chapterTime}>{ch.time}</span>
                <div className={styles.chapterInfo}>
                  <span className={styles.chapterTitle}>{ch.title}</span>
                  <span className={styles.chapterDesc}>{ch.desc}</span>
                </div>
                {activeChapter === i && <span className={styles.chapterDot} />}
              </button>
            ))}
          </div>

          {/* Resources */}
          <div className={styles.resources}>
            <h3 className={styles.chaptersHeading}>Resources</h3>
            <a href="#" className={styles.resourceLink}>📋 Cheat Sheet (PDF)</a>
            <a href="#" className={styles.resourceLink}>🔗 Tools List</a>
            <a href="#" className={styles.resourceLink}>💬 Join the Community</a>
          </div>
        </motion.aside>
      </div>

      {/* ── Related Videos ────────────────────────────────────── */}
      <section className={styles.relatedSection}>
        <div className={styles.relatedInner}>
          <h2 className={styles.sectionTitle}>More Tutorials</h2>
          <div className={styles.relatedGrid}>
            {RELATED.map((video, i) => (
              <motion.div
                key={i}
                className={styles.relatedCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                whileHover={{ y: -4 }}
              >
                <div className={styles.relatedThumb}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {video.badge && <span className={styles.relatedBadge}>{video.badge}</span>}
                </div>
                <div className={styles.relatedMeta}>
                  <h4 className={styles.relatedTitle}>{video.title}</h4>
                  <span className={styles.relatedDuration}>⏱ {video.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
