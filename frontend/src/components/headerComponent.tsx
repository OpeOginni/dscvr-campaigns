import { Gamepad } from "lucide-react";
import ConnectWalletButton from "./connectWallet";

export default function HeaderComponent() {
  return (
    <div className="flex items-center justify-between w-full py-5 px-7">
      <div>
        <Gamepad />
      </div>
      <div className="">
        <ConnectWalletButton />
      </div>
    </div>
  );
}
