import type { Campaign } from "../../interfaces/campaign.interface";

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export async function makeGraphQLQuery<T>(
  query: string,
  variables: Record<string, any>
): Promise<T> {
  if (!GRAPHQL_ENDPOINT) throw new Error();
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map((e) => e.message).join(", "));
  }

  return result.data;
}

export async function checkUserEligibility(
  campaign: Campaign,
  userId: string,
  contentId: string
): Promise<boolean> {
  const query = `
    query CheckContentAndUserActions($contentId: ContentId!, $userId: DscvrId!) {
      content(id: $contentId) {
        id
        creator {
          id
          isFollower(userId: $userId)
        }
        portal {
          id
          name
          isMember(id: $userId)
        }
      }
      user(id: $userId) {
        id
        username
        followerCount
        createdAt
        dscvrPoints
        streak {
          dayCount
        }
        reactionForContent(contentId: $contentId)
        hasCommentedOnContent(contentId: $contentId)
        wallets {
          address
          isPrimary
          walletType
          walletChainType
        }
      }
    }
  `;

  const variables = {
    contentId,
    userId,
  };

  const result = await makeGraphQLQuery<{
    content: any;
    user: any;
  }>(query, variables);

  const isEligible =
    result.user.dscvrPoints >= campaign.requiredNumberOfDSCVRPoints &&
    result.user.streak.dayCount >= campaign.requiredDSCVRStreakDays &&
    (campaign.allowRecentAccounts ||
      isAccountOldEnough(result.user.createdAt)) &&
    (!campaign.shouldFollowCreator || result.content.creator.isFollower) &&
    (!campaign.shouldReactToPost || result.user.reactionForContent) &&
    (!campaign.shouldCommentOnPost || result.user.hasCommentedOnContent) &&
    (!campaign.shouldBePortalMember || result.content.portal.isMember);

  return isEligible;
}

function isAccountOldEnough(createdAt: string): boolean {
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
  return accountAge >= oneMonthInMs;
}
