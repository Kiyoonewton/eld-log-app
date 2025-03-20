// import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";
import { TripProvider } from "@/context/TripContext";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-J5JBCXR6J0" />

      <body style={{ background: "#fff" }}
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TripProvider>{children}</TripProvider>
      </body>
    </html>
  );
}
