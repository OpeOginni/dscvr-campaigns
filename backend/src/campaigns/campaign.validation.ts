import Joi from 'joi';

export const createCampaignValidation = Joi.object({
  title: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  creator: Joi.string().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').required(),
  image: Joi.string().optional(),
  tokenName: Joi.string().optional(),
  tokenSymbol: Joi.string().optional(),
  distribution: Joi.object({
    type: Joi.string().valid('NFT', 'TOKEN').required(),
    maxDistribution: Joi.number().required(),
  }).required(),
  config: Joi.object({
    requiredNumberOfDSCVRPoints: Joi.number().required(),
    requiredDSCVRStreakDays: Joi.number().required(),
    allowRecentAccounts: Joi.boolean().required(),
    shouldFollowCreator: Joi.boolean().required(),
    shouldReactToPost: Joi.boolean().required(),
    shouldCommentOnPost: Joi.boolean().required(),
    shouldBePortalMember: Joi.boolean().required(),
  }).required(),
});

export const queryValidation = Joi.object({
  page: Joi.number().optional().allow(null).empty("").integer().min(1).message('Page must be a positive integer'),
  limit: Joi.number().optional().allow(null).empty("").integer().min(1).message('Limit must be a positive integer'),
});

export const leaderBoardValidation = queryValidation.keys({
  campaignId: Joi.string().required(),
});