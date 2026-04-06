import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "./wallet-provider";

export const metadata: Metadata = {
  title: "DataShare",
  description: "Decentralized Dataset Library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}