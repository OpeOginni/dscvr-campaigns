import { createMiddleware } from "hono/factory"
import Joi from 'joi';
import { ICampaign } from "./campaign.schema";

export const createCampaignMiddleware = createMiddleware<{
  Variables: {
    validated: () => ICampaign
  }
}>(async (c, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    creator: Joi.string().required(),
    distribution: Joi.object({
      type: Joi.string().valid('NFT', 'TOKEN').required(),
      numberOrUserRewards: Joi.number().required(),
    }).required(),
  });

  const body = await c.req.json();
  const { error, value } = schema.validate(body, { abortEarly: false });
  if (error) {
    c.status(400);
    c.res = new Response(JSON.stringify({ error: error.details.map(e => e.message) }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return;
    // c.throw(400, error.details[0].message);
  }

  c.set('validated', () => value);
  await next();
});