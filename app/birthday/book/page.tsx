"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { book, type Sticker } from "../content";

const R = "/book";

type Page = { kind: "cover" } | { kind: "chapter"; n: number };
const pages: Page[] = [
  { kind: "cover" },
  ...book.chapters.map((_, n) => ({ kind: "chapter", n }) as Page),
];

function Photo({ src, pos }: { src?: string; pos?: string }) {
  return (
    <div className="photo">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" draggable={false} style={{ objectPosition: pos }} />
      ) : (
        <span>your photo here</span>
      )}
    </div>
  );
}

function StickerImg({ s, rot }: { s: Sticker; rot: number }) {
  const common = { draggable: false, alt: "" } as const;
  const map: Record<Sticker, { src: string; style: React.CSSProperties }> = {
    heart: { src: `${R}/heart.png`, style: { left: "-6%", top: "-5%", width: "17%" } },
    stars: { src: `${R}/stars.png`, style: { right: "-8%", bottom: "-6%", width: "34%" } },
    cupcake: { src: `${R}/cupcake.png`, style: { right: "-9%", top: "-9%", width: "30%" } },
    favorite: { src: `${R}/favorite.png`, style: { right: "-8%", top: "-12%", width: "48%" } },
    envelope: { src: `${R}/envelope.png`, style: { right: "-12%", bottom: "-12%", width: "30%" } },
  };
  const m = map[s];
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...common} src={m.src} style={{ position: "absolute", transform: `rotate(${rot}deg)`, ...m.style }} />;
}

function Spread({ i }: { i: number }) {
  const p = pages[i];
  return (
    <div className="sp">
      <div className="sp-paper" />
      {p.kind === "cover" ? (
        <>
          <div className="sp-age">{book.age}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sp-cupcake" src={`${R}/cupcake.png`} alt="" draggable={false} />
          <div className="sp-text cover">
            {book.cover.greeting.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
          <div className="sp-stripes" />
          <div className="sp-polaroid cover">
            <Photo src={book.cover.photo} pos={book.cover.pos} />
            <StickerImg s="favorite" rot={-2} />
            <StickerImg s="heart" rot={-8} />
            <StickerImg s="stars" rot={0} />
          </div>
          <div className="sp-caption">{book.cover.caption}</div>
        </>
      ) : (
        (() => {
          const c = book.chapters[p.n];
          return (
            <>
              <div className="sp-polaroid chap" style={{ ["--r" as string]: `${p.n % 2 ? -4 : 4}deg` }}>
                <Photo src={c.photo} pos={c.pos} />
                <StickerImg s={c.sticker} rot={p.n % 2 ? 6 : -4} />
                {c.caption && <div className="cap">{c.caption}</div>}
              </div>
              <div className="sp-num-label">{c.num}</div>
              <div className="sp-label">{c.title}</div>
              <div className="sp-text chap">{c.text}</div>
              <div className="sp-num">{i + 1} / {pages.length}</div>
            </>
          );
        })()
      )}
    </div>
  );
}

export default function BookPage() {
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<{ lo: number; angle: number; to: number } | null>(null);
  const busy = useRef(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      const to = page + dir;
      if (busy.current || to < 0 || to >= pages.length) return;
      busy.current = true;
      const lo = Math.min(page, to);
      const start = dir === 1 ? 0 : -180;
      const end = dir === 1 ? -180 : 0;
      setFlip({ lo, angle: start, to });
      requestAnimationFrame(() => requestAnimationFrame(() => setFlip({ lo, angle: end, to })));
      setTimeout(() => {
        setPage(to);
        setFlip(null);
        busy.current = false;
      }, 900);
    },
    [page],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const shown = flip ? flip.to : page;

  return (
    <main className="bk-page">
      <div
        className="bk-book"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          go(e.clientX - r.left > r.width / 2 ? 1 : -1);
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) {
            e.preventDefault();
            go(dx < 0 ? 1 : -1);
          }
        }}
      >
        {flip ? (
          <>
            <div className="bk-full"><Spread i={flip.lo + 1} /></div>
            <div className="bk-clip left"><Spread i={flip.lo} /></div>
            <div className="bk-flipper" style={{ transform: `rotateY(${flip.angle}deg)` }}>
              <div className="bk-face front"><Spread i={flip.lo} /></div>
              <div className="bk-face back"><Spread i={flip.lo + 1} /></div>
            </div>
          </>
        ) : (
          <div className="bk-full"><Spread i={page} /></div>
        )}
      </div>

      <div className="bk-controls">
        <button className="bk-btn" aria-label="Previous page" disabled={shown === 0} onClick={() => go(-1)}>‹</button>
        <div className="bk-dots" aria-hidden>
          {pages.map((_, i) => <i key={i} className={i === shown ? "on" : ""} />)}
        </div>
        <button className="bk-btn" aria-label="Next page" disabled={shown === pages.length - 1} onClick={() => go(1)}>›</button>
      </div>
      <p className="bk-hint">{page === 0 && !flip ? "swipe or tap to turn the page" : " "}</p>
    </main>
  );
}
