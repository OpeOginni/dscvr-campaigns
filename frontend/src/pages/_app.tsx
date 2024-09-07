import HeaderComponent from "@/component/headerComponent";
import { SolanaWalletProvider } from "@/provider/SolanaWalletProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="description" content="DSCVR Example Canvas - Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="dscvr:canvas:version" content="vNext" />{" "}
      </Head>
      <SolanaWalletProvider>
        <HeaderComponent />
        <Component {...pageProps} />
      </SolanaWalletProvider>
    </>
  );
}
