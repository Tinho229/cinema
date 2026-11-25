import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";

export const display = localFont({
  src: "../fonts/FriggCafe-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
