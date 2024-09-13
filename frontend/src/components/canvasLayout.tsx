import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryClientProvider } from "@/provider/ReactQueryClientProvider";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { CanvasProvider } from "../provider/canvas";

export default function CanvasLayout({ children }) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  return (
    <>
      <Head>
        <meta name="description" content="DSCVR Example Canvas - Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="dscvr:canvas:version" content="vNext" />{" "}
      </Head>
      <CanvasProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={[]}>
            <ReactQueryClientProvider>
              {children}
              <Toaster />
            </ReactQueryClientProvider>
          </WalletProvider>
        </ConnectionProvider>
      </CanvasProvider>
    </>
  );
}
