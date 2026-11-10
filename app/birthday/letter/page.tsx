import Link from "next/link";
import { content } from "../content";
import { Dots } from "../dots";

export default function LetterPage() {
  return (
    <main className="bd-page">
      <div className="bd-inner">
        <article className="bd-paper">
          <h1 className="bd-script">Dear {content.recipient},</h1>
          {content.letter.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="bd-sign">with love, {content.sender}</p>
        </article>
        <Link className="bd-next" href="/birthday/memories">turn the page →</Link>
        <Dots at={1} />
      </div>
    </main>
  );
}
