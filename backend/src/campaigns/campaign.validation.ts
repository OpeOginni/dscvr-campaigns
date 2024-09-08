import Joi from 'joi';

export const createCampaignValidation = Joi.object({
  title: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  creator: Joi.string().required(),
  distribution: Joi.object({
    type: Joi.string().valid('NFT', 'TOKEN').required(),
    numberOrUserRewards: Joi.number().required(),
  }).required(),
});

export const queryValidation = Joi.object({
  page: Joi.number().optional().allow(null).empty("").integer().min(1).message('Page must be a positive integer'),
  limit: Joi.number().optional().allow(null).empty("").integer().min(1).message('Limit must be a positive integer'),
});

export const leaderBoardValidation = queryValidation.keys({
  campaignId: Joi.string().required(),
});