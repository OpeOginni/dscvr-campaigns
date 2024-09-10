export enum CampaignStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum DistributionType {
  NFT = "NFT",
  TOKEN = "TOKEN",
}
// Define the interface for the Campaign document
export interface ICampaign extends Document {
  id: string;
  title: string;
  slug?: string;
  startDate: Date;
  endDate: Date;
  creator: string;
  status: CampaignStatus;
  tokenName?: string;
  tokenSymbol?: string;
  distribution: DistributionType; // 'nft' | 'token'
  maxDistribution: number;
  requiredNumberOfDSCVRPoints: number;
  requiredDSCVRStreakDays: number;
  allowRecentAccounts: boolean;
  shouldFollowCreator: boolean;
  shouldReactToPost: boolean;
  shouldCommentOnPost: boolean;
  shouldBePortalMember: boolean;
  distributedTokenAddress: string;
  numberOfTokensAlreadyDistributed: number;
  image: any;
  imageURI: string;
  tokenMintAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
