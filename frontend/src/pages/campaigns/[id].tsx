/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeaderComponent from "@/components/headerComponent";
import {
  Loader2,
  Calendar,
  Users,
  Coins,
  Image as ImageIcon,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";
import { useState } from "react";
import type { ICampaign } from "../../../interfaces/campaign.interface";

export default function CampaignDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { publicKey } = useWallet();
  const [, copy] = useCopyToClipboard();
  const [showCopied, setShowCopied] = useState(false);

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
    enabled: !!id && !!publicKey,
  });

  const canvasLink = `${
    process.env.NEXT_PUBLIC_URL || "https://localhost:3000"
  }/canvas/${id}`;

  const handleCopy = () => {
    copy(canvasLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderComponent />
      <main className="container mx-auto px-4 py-8">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="flex items-center mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            <p className="mt-4 text-lg text-gray-600">
              Loading campaign details...
            </p>
          </div>
        ) : !campaign?.data ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg text-gray-600">Campaign not found</p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6">{campaign.data.title}</h1>

              <div className="flex items-center mb-4">
                <Badge
                  className={
                    campaign.data.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                  variant="outline"
                >
                  {campaign.data.status}
                </Badge>
                <span className="ml-4 text-gray-500">
                  {campaign.data.distribution === "NFT" ? (
                    <ImageIcon className="inline-block w-5 h-5 mr-1" />
                  ) : (
                    <Coins className="inline-block w-5 h-5 mr-1" />
                  )}
                  {campaign.data.distribution}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Campaign Details
                  </h2>
                  <ul className="space-y-2">
                    <li>
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                      Start Date:{" "}
                      {new Date(campaign.data.startDate).toLocaleDateString()}
                    </li>
                    {campaign.data.endDate && (
                      <li>
                        <Calendar className="inline-block w-4 h-4 mr-2" />
                        End Date:{" "}
                        {new Date(campaign.data.endDate).toLocaleDateString()}
                      </li>
                    )}
                    <li>
                      <Users className="inline-block w-4 h-4 mr-2" />
                      Max Distribution: {campaign.data.maxDistribution}
                    </li>
                    {campaign.data.distribution === "TOKEN" && (
                      <>
                        <li>Token Name: {campaign.data.tokenName}</li>
                        <li>Token Symbol: {campaign.data.tokenSymbol}</li>
                      </>
                    )}
                    {campaign.data.distribution === "NFT" &&
                      campaign.data.image && (
                        <li>
                          <img
                            src={campaign.data.image}
                            alt="NFT Preview"
                            className="mt-2 max-w-xs rounded-lg shadow-md"
                          />
                        </li>
                      )}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Requirements</h2>
                  <ul className="space-y-2">
                    <li>
                      DSCVR Points: {campaign.data.requiredNumberOfDSCVRPoints}
                    </li>
                    <li>
                      DSCVR Streak Days: {campaign.data.requiredDSCVRStreakDays}
                    </li>
                    <li className="flex items-center gap-3">
                      <span>Allow Recent Accounts:</span>
                      <Badge
                        variant={
                          campaign.data.allowRecentAccounts
                            ? "success"
                            : "destructive"
                        }
                      >
                        {campaign.data.allowRecentAccounts ? "Yes" : "No"}
                      </Badge>
                    </li>
                    <li className="flex items-center gap-3">
                      <span>Must Follow Creator:</span>
                      <Badge
                        variant={
                          campaign.data.shouldFollowCreator
                            ? "success"
                            : "destructive"
                        }
                      >
                        {campaign.data.shouldFollowCreator ? "Yes" : "No"}
                      </Badge>
                    </li>
                    <li className="flex items-center gap-3">
                      <span>Must React to Post:</span>
                      <Badge
                        variant={
                          campaign.data.shouldReactToPost
                            ? "success"
                            : "destructive"
                        }
                      >
                        {campaign.data.shouldReactToPost ? "Yes" : "No"}
                      </Badge>
                    </li>
                    <li className="flex items-center gap-3">
                      <span>Must Comment on Post:</span>
                      <Badge
                        variant={
                          campaign.data.shouldCommentOnPost
                            ? "success"
                            : "destructive"
                        }
                      >
                        {campaign.data.shouldCommentOnPost ? "Yes" : "No"}
                      </Badge>
                    </li>
                    <li className="flex items-center gap-3">
                      <span>Must Be Portal Member:</span>
                      <Badge
                        variant={
                          campaign.data.shouldBePortalMember
                            ? "success"
                            : "destructive"
                        }
                      >
                        {campaign.data.shouldBePortalMember ? "Yes" : "No"}
                      </Badge>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => router.push(`/campaigns/${id}/edit`)}
                  className="mr-4"
                >
                  Edit Campaign
                </Button>
                <Button
                  onClick={() => router.push(`/campaigns/${id}/leaderboard`)}
                >
                  View Leaderboard
                </Button>
              </div>

              {/* Add this new section for the canvas link */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Canvas Link</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={canvasLink}
                    readOnly
                    className="flex-grow p-2 border rounded"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="icon"
                    className="w-10 h-10"
                  >
                    {showCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
