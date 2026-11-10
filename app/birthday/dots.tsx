export function Dots({ at }: { at: number }) {
  return (
    <div className="bd-dots" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className={i === at ? "on" : ""} />
      ))}
    </div>
  );
}
