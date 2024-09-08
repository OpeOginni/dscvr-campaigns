import { Button } from "@/components/ui/button";
import { useCanvasClient } from "@/hooks/useCanvasClient";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Campaign } from "../../../interfaces/campaign.interface";
import { checkUserEligibility } from "@/utils/graphql";
import { useToast } from "@/hooks/use-toast";

export default function CampaignCanvas() {
  const router = useRouter();
  const { id } = router.query;
  const { user, content, isReady } = useCanvasClient();
  const { toast } = useToast();

  const { data: campaign, isLoading } = useQuery<{
    data: Campaign;
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

  console.log(campaign);
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
    <div className="min-h-screen p-2">
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <h1 className="text-center text-xl font-bold">
          {campaign.data.title} Canvas Campaign
        </h1>

        <div className="flex flex-row w-full max-w-md justify-between">
          <div className="text-left w-1/2">
            <h2 className="text-lg font-bold">Requirements:</h2>
            <ul className="list-disc pl-5 text-sm">
              {!campaign.data.allowRecentAccounts && (
                <li>Recent accounts not allowed</li>
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

          <div className="text-left w-1/2">
            <h2 className="text-lg font-bold">Reward Type:</h2>
            <p className="text-sm">
              {campaign.data.distribution === "NFT" ? "NFT" : "TOKEN"} will be
              distributed as a reward.
            </p>
          </div>
        </div>

        {isTooEarly && (
          <p className="text-red-500 text-sm">
            The campaign has not started yet.
          </p>
        )}
        {isTooLate && (
          <p className="text-red-500 text-sm">The campaign has ended.</p>
        )}

        {!isTooEarly && !isTooLate && (
          <Button
            className="w-24 mt-4"
            onClick={async () => {
              const isEligible = await checkUserEligibility(
                campaign.data,
                user.id,
                content?.id || "1201336789738979476"
              );
              if (isEligible) {
                // Proceed with minting
                console.log("User is eligible to mint");
              } else {
                // Show an error message
                console.log("User is not eligible to mint");
                toast({
                  title: "Failed to mint",
                  description: "Make sure you meet all requiremnts",
                  variant: "destructive",
                });
              }
            }}
          >
            Mint {campaign.data.distribution}
          </Button>
        )}
      </div>
    </div>
  );
}
