import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { AuthProvider } from "./auth/AuthContext";

const appSans = Nunito({
  variable: "--font-app-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FRESH O! - Pre-Harvest Marketplace",
  description: "Connecting farmers and bulk buyers through pre-harvest booking",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1b5e20",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={appSans.variable}>
      <body>
        <AuthProvider>
          {children}
          <RegisterServiceWorker />
        </AuthProvider>
      </body>
    </html>
  );
}
