import Link from "next/link";
import { content } from "../content";
import { Dots } from "../dots";

const hearts = [8, 22, 35, 50, 63, 78, 90];

export default function WishPage() {
  return (
    <main className="bd-page">
      <div className="bd-hearts" aria-hidden>
        {hearts.map((left, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={left} src="/birthday/35bbaceb2b42e9daea562ec022646bde.png" alt="" style={{ left: `${left}%`, animationDelay: `${i * 1.2}s` }} />
        ))}
      </div>
      <div className="bd-inner" style={{ position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="bd-hero" src="/birthday/d133dc4292b117ff91e22ed638810781.png" alt="A bouquet of red roses" />
        <h1 className="bd-title bd-script">Happy Birthday</h1>
        <p style={{ fontSize: 24, textAlign: "center", margin: 0 }}>{content.wish}</p>
        <Link className="bd-next" href="/birthday">↺ open the card again</Link>
        <Dots at={3} />
      </div>
    </main>
  );
}
