import "./birthday.css";

export default function BirthdayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Gaegu&family=Mrs+Saint+Delafield&display=swap"
      />
      {children}
    </>
  );
}
