import { SolanaWalletProvider } from "@/provider/SolanaWalletProvider";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryClientProvider } from "@/provider/ReactQueryClientProvider";

export default function MainLayout({ children }) {
  return (
    <>
      <Head>
        <meta name="description" content="DSCVR Example Canvas - Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="dscvr:canvas:version" content="vNext" />{" "}
      </Head>
      <SolanaWalletProvider>
        <ReactQueryClientProvider>
          {children}
          <Toaster />
        </ReactQueryClientProvider>
      </SolanaWalletProvider>
    </>
  );
}
