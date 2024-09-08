import { createMiddleware } from "hono/factory"
import Joi from 'joi';

export const createCampaignMiddleware = createMiddleware(async (c, next) => {
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
  const { error } = schema.validate(body, { abortEarly: false });
  if (error) {
    c.status(400);
    c.res = new Response(JSON.stringify({ error: error.details.map(e => e.message) }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return;
  }
  await next();
});

export const getCampaignMiddleware = createMiddleware(async (c, next) => {
  const { q, limit = 10, page = 1 } = c.req.query()
  const data = { limit, page };
  const schema = Joi.object({
    page: Joi.number().optional().allow(null).empty("").integer().min(1).message('Page must be a positive integer'),
    limit: Joi.number().optional().allow(null).empty("").integer().min(1).message('Limit must be a positive integer'),
  });
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    console.log('error', error);
    c.status(400);
    c.res = new Response(JSON.stringify({ error: error.details.map(e => e.message) }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return;
  }
  await next();
});