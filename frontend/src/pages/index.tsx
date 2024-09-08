import CampaignComponent from "@/components/campaignComponent";
import CreateCampaignsDialog from "@/components/createCampaignsDialog";
import HeaderComponent from "@/components/headerComponent";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PackagePlus, Ghost, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/campaigns/creators`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(publicKey && {
              Authorization: `Bearer ${publicKey.toBase58()}`,
            }),
          },
        }
      );
      return res.json();
    },
    enabled: connected && !!publicKey,
  });

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <HeaderComponent />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-white">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to DSCVR Campaigns
          </h1>
          <p className="text-xl mb-8">
            Create and manage your campaigns with ease
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            Connect Wallet to Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeaderComponent />

      <div className="flex justify-center pt-20 pb-9">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="relative flex items-center gap-4 rounded-lg border-2 w-1/3 h-12 hover:shadow-md"
            >
              <div className="absolute pl-4">
                <PackagePlus className="w-7 h-7" />
              </div>
              <p className="w-full text-xl text-center">
                Create a new Campaign
              </p>
            </button>
          </DialogTrigger>
          <CreateCampaignsDialog />
        </Dialog>
      </div>

      <div className="flex w-full justify-center pt-3">
        <div className="flex flex-col justify-center w-1/2 gap-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
              <p className="mt-4 text-lg text-gray-600">Loading campaigns...</p>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            data.data.map(
              (campaign: {
                id: string;
                title: string;
                status: string;
                distribution: "TOKEN" | "NFT";
              }) => (
                <CampaignComponent
                  id={campaign.id}
                  key={campaign.id}
                  title={campaign.title}
                  status={campaign.status}
                  distribution={campaign.distribution}
                />
              )
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Ghost className="w-16 h-16 text-gray-400" />
              <p className="mt-4 text-lg text-gray-600">No campaigns found</p>
              <p className="text-sm text-gray-500">
                Create your first campaign to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
