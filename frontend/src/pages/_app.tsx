import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";

export default function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page: ReactNode) => page);

  return getLayout(<Component {...pageProps} />);
}
