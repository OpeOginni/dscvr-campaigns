export interface Campaign {
  id: string;
  title: string;
  status: string;
  distribution: "TOKEN" | "NFT";
  startDate: string;
  endDate?: string;
  maxDistribution: number;
  tokenName?: string;
  tokenSymbol?: string;
  image?: string;
  requiredNumberOfDSCVRPoints: number;
  requiredDSCVRStreakDays: number;
  allowRecentAccounts: boolean;
  shouldFollowCreator: boolean;
  shouldReactToPost: boolean;
  shouldCommentOnPost: boolean;
  shouldBePortalMember: boolean;
  creator: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
