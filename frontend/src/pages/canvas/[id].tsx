import { Button } from "@/components/ui/button";
import { useCanvasClient } from "@/hooks/useCanvasClient";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { ICampaign } from "../../../interfaces/campaign.interface";
import { checkUserEligibility } from "@/utils/graphql";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import CanvasLayout from "@/components/canvasLayout";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { CANVAS_WALLET_NAME } from "@dscvr-one/canvas-wallet-adapter";
import { useCanvasContext } from "../../provider/canvas";

export default function CampaignCanvas() {
  const router = useRouter();
  const canvasContext = useCanvasContext();
  const walletContext = useWallet();
  const connectionContext = useConnection();
  const { id } = router.query;
  const { user, content, isReady } = useCanvasClient();
  const { toast } = useToast();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  // since wallets list not only `DSCVR Canvas` but also other extensions, we do a default select to DSCVR Canvas.
  useEffect(() => {
    if (walletContext.wallet?.adapter.name === CANVAS_WALLET_NAME) return;
    const exists = walletContext.wallets.find(
      (w) => w.adapter.name === CANVAS_WALLET_NAME
    );
    if (exists) {
      walletContext.select(exists.adapter.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletContext.wallets, walletContext.wallet]);

  const { data: campaign, isLoading } = useQuery<{
    data: ICampaign;
    message: string;
  }>({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/campaign/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.json();
    },
    enabled: isReady && !!id,
  });

  const handleMintToken = async (_campaign: ICampaign, userId: string) => {
    setIsButtonLoading(true);
    try {
      const { isEligible } = await checkUserEligibility(
        _campaign,
        userId,
        content?.id || "1201336789738979476"
      );

      if (!isEligible) {
        toast({
          title: "Failed to mint",
          description: "Make sure you meet all requirements",
          variant: "destructive",
        });
        setIsButtonLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/campaigns/${id}/interact`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            walletAddress: walletContext.publicKey?.toBase58(),
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Token Minted Successfully",
        });
      } else {
        toast({
          title: "Failed to Mint Token",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error minting token:", error);
      toast({
        title: "Failed to Mint Token",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsButtonLoading(false); // Set loading state to false
    }
  };

  if (!canvasContext.client?.isReady) {
    return (
      <main className="flex flex-col items-center justify-center p-24">
        <h1 className="text-3xl font-semibold text-center">Loading...</h1>
      </main>
    );
  }

  if (!isReady || isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
        <p className="mt-4 text-lg text-gray-600">
          Loading campaign details...
        </p>
      </div>
    );
  }

  if (!campaign?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Campaign not found</p>
      </div>
    );
  }

  const currentDate = new Date();
  const isTooEarly = currentDate < new Date(campaign.data.startDate);
  const isTooLate =
    campaign.data.endDate && currentDate > new Date(campaign.data.endDate);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <h1 className="text-center text-2xl font-bold text-gray-800">
          {campaign.data.title} Canvas Campaign
        </h1>

        <div className="flex flex-row w-full max-w-2xl justify-between gap-4">
          <div className="bg-white shadow-md rounded-lg p-4 w-1/2">
            <h2 className="text-lg font-bold text-gray-700">Requirements:</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {!campaign.data.allowRecentAccounts && (
                <li>Recent accounts not allowed (3 Days)</li>
              )}
              {campaign.data.shouldFollowCreator && (
                <li>Must follow the creator</li>
              )}
              {campaign.data.shouldReactToPost && (
                <li>Must react to the post</li>
              )}
              {campaign.data.shouldCommentOnPost && (
                <li>Must comment on the post</li>
              )}
              {campaign.data.shouldBePortalMember && (
                <li>Must be a portal member</li>
              )}
              {campaign.data.requiredNumberOfDSCVRPoints > 0 && (
                <li>
                  At least {campaign.data.requiredNumberOfDSCVRPoints} DSCVR
                  points
                </li>
              )}
              {campaign.data.requiredDSCVRStreakDays > 0 && (
                <li>
                  {campaign.data.requiredDSCVRStreakDays}-day DSCVR streak
                </li>
              )}
              <li>
                Starts: {new Date(campaign.data.startDate).toLocaleDateString()}
              </li>
              {campaign.data.endDate && (
                <li>
                  Ends: {new Date(campaign.data.endDate).toLocaleDateString()}
                </li>
              )}
            </ul>
          </div>

          <div className="bg-white shadow-md rounded-lg p-4 w-1/2">
            <h2 className="text-lg font-bold text-gray-700">Reward Type:</h2>
            <p className="text-sm text-gray-600">
              {campaign.data.distribution === "NFT" ? "NFT" : "TOKEN"} will be
              distributed as a reward.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-2xl mt-4">
          <h2 className="text-lg font-bold text-gray-700">Minting Status:</h2>
          <p className="text-sm text-gray-600">
            Amount Minted: {campaign.data.numberOfTokensAlreadyDistributed || 0}{" "}
            / {campaign.data.maxDistribution}
          </p>
          <p className="text-sm text-gray-600">
            Amount Left to Mint:{" "}
            {campaign.data.maxDistribution -
              (campaign.data.numberOfTokensAlreadyDistributed || 0)}
          </p>
        </div>

        {isTooEarly && (
          <p className="text-red-500 text-sm">
            The campaign has not started yet.
          </p>
        )}
        {isTooLate && (
          <p className="text-red-500 text-sm">The campaign has ended.</p>
        )}

        {walletContext.publicKey ? (
          !isTooEarly && !isTooLate ? (
            <Button
              className="text-white font-bold py-2 px-4 border-b-4 rounded bg-gray-800 hover:bg-gray-700 border-gray-900 hover:border-gray-800 w-24 mt-4"
              onClick={() => handleMintToken(campaign.data, user.id)}
              disabled={isButtonLoading}
            >
              {isButtonLoading
                ? "Minting..."
                : `Mint ${campaign.data.distribution}`}
            </Button>
          ) : null
        ) : (
          <button
            type="button"
            onClick={() => walletContext.connect()}
            className="text-white font-bold py-2 px-4 border-b-4 rounded bg-purple-500 hover:bg-purple-400 border-purple-700 hover:border-purple-500"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

CampaignCanvas.getLayout = function getLayout(page) {
  return <CanvasLayout>{page}</CanvasLayout>;
};
