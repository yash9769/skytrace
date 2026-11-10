"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Recreation of the "Happy birthday" card (littlelovenote.my.canva.site).
 * Layout is a fixed 640x400 stage (coordinates measured from the original at
 * 1280x800) that scales to fit the viewport.
 */

const A = "/birthday";

type Layer = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  coral?: boolean;
  z: number;
};

// x/y are relative to the stage origin; z controls stacking.
const layers: Layer[] = [
  { src: "94bf35e163d58907ec6d8ecd923ffddf.png", x: 0, y: 210, w: 225, h: 165, z: 5 }, // camera
  { src: "d133dc4292b117ff91e22ed638810781.png", x: 393, y: 55, w: 240, h: 320, z: 5 }, // bouquet
  { src: "74993871601702c518b93cd14e252ab1.png", x: 172, y: 227, w: 54, h: 44, z: 6 }, // ribbon
  { src: "35bbaceb2b42e9daea562ec022646bde.png", x: 400, y: 227, w: 36, h: 34, z: 6 }, // heart sticker
  { src: "bfd40846bd041a8b4425f6317d34ed12.svg", x: 381, y: 275, w: 39, h: 39, z: 6, coral: true }, // small hearts
];

export default function BirthdayPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const openCard = () => {
    setOpen(true);
    setTimeout(() => router.push("/birthday/letter"), 700);
  };

  return (
    <main className="stage-wrap">
      <button
        type="button"
        className="stage"
        aria-label="Open the birthday card"
        onClick={openCard}
      >
        {/* tilted envelope group: back, paper card, front flap */}
        <div className="envelope">
          <img src={`${A}/7a6cc6c8b1774a7bdd4de327deb1d8e4.png`} alt="" draggable={false} className="env-back" />
          <div className={`card ${open ? "card-open" : ""}`}>
            <span>Happy</span>
            <span>Birthday</span>
          </div>
          <img src={`${A}/cb8830f7e0107e1d5048332ba94cd60a.png`} alt="" draggable={false} className="env-front" />
        </div>

        {layers.map((l) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={l.src}
            src={`${A}/${l.src}`}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left: l.x,
              top: l.y,
              width: l.w,
              height: l.h,
              zIndex: l.z,
              transform: l.rotate ? `rotate(${l.rotate}deg)` : undefined,
              filter: l.coral ? "saturate(0.55) brightness(1.45)" : undefined,
            }}
          />
        ))}

        <span className="cta">click me!</span>
      </button>

      <style>{`
        .stage-wrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #702426;
          overflow: hidden;
        }
        .stage {
          position: relative;
          width: 640px;
          height: 420px;
          border: 0;
          padding: 0;
          background: none;
          cursor: pointer;
          transform: translate(20px, 25px);
          transform-origin: center;
          -webkit-tap-highlight-color: transparent;
        }
        .envelope {
          position: absolute;
          z-index: 2;
          left: 118px;
          top: 14px;
          width: 395px;
          height: 368px;
          transform: scale(0.9) rotate(-8deg);
          transform-origin: 50% 50%;
        }
        .envelope img { position: absolute; display: block; }
        .env-back { left: 0; top: 0; width: 395px; height: 368px; }
        .env-front { left: 25px; top: 161px; width: 345px; height: 207px; z-index: 3; }
        .card {
          position: absolute;
          z-index: 2;
          left: 45px;
          top: 82px;
          width: 262px;
          height: 185px;
          background: #fff url(${A}/619b416958c9800a9515015a949fd6bb.png) center / cover;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 14px;
          font-family: "Mrs Saint Delafield", "Snell Roundhand", cursive;
          font-size: 46px;
          line-height: 0.9;
          color: #111;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .card span:last-child { margin-left: 10px; }
        .card-open { transform: translateY(-60px); }
        .cta {
          position: absolute;
          left: 0;
          right: 0;
          top: 372px;
          text-align: center;
          font-family: Gaegu, "Comic Sans MS", cursive;
          font-size: 22px;
          color: #fff;
        }
        @media (max-width: 680px) { .stage { transform: translate(8px, 10px) scale(0.55); } }
        @media (max-width: 400px) { .stage { transform: translate(4px, 8px) scale(0.45); } }
        .stage:hover .cta { text-decoration: underline; }
        .stage:focus-visible { outline: 2px dashed #fff; outline-offset: 8px; }
      `}</style>
    </main>
  );
}
