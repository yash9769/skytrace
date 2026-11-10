import Link from "next/link";
import { content } from "../content";
import { Dots } from "../dots";

export default function MemoriesPage() {
  return (
    <main className="bd-page">
      <div className="bd-inner">
        <h1 className="bd-title bd-script">Little memories</h1>
        <div className="bd-polaroids">
          {content.memories.map((m) => (
            <figure key={m.caption} className="bd-polaroid" style={{ margin: 0 }}>
              <div className="bd-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/birthday/94bf35e163d58907ec6d8ecd923ffddf.png" alt="" />
              </div>
              <figcaption>
                <b>{m.caption}</b>
                <small>{m.note}</small>
              </figcaption>
            </figure>
          ))}
        </div>
        <Link className="bd-next" href="/birthday/wish">one last thing →</Link>
        <Dots at={2} />
      </div>
    </main>
  );
}
