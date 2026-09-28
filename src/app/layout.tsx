import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { displayFont } from "./components/layout/displayFont";
import { RegisterServiceWorker } from "./register-sw";
import { AuthProvider } from "./auth/AuthContext";
import { CreateBatchPanelProvider } from "./farmer/batches/CreateBatchPanelContext";
import { CreateBatchPanelHost } from "./farmer/batches/CreateBatchPanelHost";

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
    <html lang="vi" className={`${appSans.variable} ${displayFont.variable}`}>
      <body>
        <AuthProvider>
          <CreateBatchPanelProvider>
            {children}
            <CreateBatchPanelHost />
            <RegisterServiceWorker />
          </CreateBatchPanelProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
