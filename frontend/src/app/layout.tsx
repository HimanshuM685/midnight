import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midnight ZK Tip Jar | Privacy-Preserving Micropayments",
  description:
    "Tip anonymously on Midnight Network using Compact Zero-Knowledge SNARK proofs. Configure any pay-to-address destination with complete donor identity shielding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
