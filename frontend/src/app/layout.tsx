import type { Metadata } from "next";

import "bootstrap/dist/css/bootstrap.min.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Northstar Estates | Homes worth coming home to",
  description:
    "A considered collection of exceptional homes across the US and UK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
