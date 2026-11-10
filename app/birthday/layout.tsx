import "./birthday.css";

export default function BirthdayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Gaegu:wght@400;700&family=Mrs+Saint+Delafield&display=swap"
      />
      {children}
    </>
  );
}
