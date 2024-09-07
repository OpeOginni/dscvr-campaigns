import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const ConnectWalletButton = () => {
  return (
    <div>
      <WalletMultiButtonDynamic />
    </div>
  );
};

export default ConnectWalletButton;

// https://www.0xdev.co/how-to-connect-to-a-solana-wallet-to-your-react-app/
