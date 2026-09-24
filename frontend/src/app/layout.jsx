import "./globals.css";
export const metadata = {
  title: "Oneput",
  description:
    "Oneput collects your company's data by talking to the people who own it, all year, and hands back a structured, sourced record.",
  icons: { icon: "/assets/oneput-icon.png" },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
