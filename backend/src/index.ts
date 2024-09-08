import { serve } from '@hono/node-server';
import * as dotenv from 'dotenv';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createCampaign, getCampaignLeaderBoard, getCampaigns, getCreatorCampaigns } from './campaigns/campaign.service';
import { createCampaignValidation, leaderBoardValidation, queryValidation } from './campaigns/campaign.validation';
import { connectToMongoDB } from './database/mongoose.connection';
import { validationMiddleware } from './shared/utils.shared';
dotenv.config();

const MONGO_DB_URI = process.env.MONGO_DB_URI;
const PORT = process.env.PORT;
const app = new Hono()

app.use('*', cors())
app.use(logger())

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.post('/campaigns', validationMiddleware(createCampaignValidation), async (c) => {
  const body = await c.req.json();
  const newCampaign = await createCampaign(body);
  return c.json({ message: 'Campaign created successfully', data: newCampaign })
})

app.get('/campaigns', validationMiddleware(queryValidation), async (c) => {
  const { limit = 10, page = 1, ...q } = c.req.query()
  // const allCookies = getCookie(c);
  // console.log(allCookies)
  // console.log(q, limit, page)
  // const query = q ? { title: { $regex: q, $options: 'i' } } : {};
  // const query = q || {};
  const campaigns = await getCampaigns(Number(page), Number(limit));
  return c.json({ message: 'All campaigns', ...campaigns })
})

app.patch('/campaigns', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.get('/campaigns/creators', validationMiddleware(queryValidation), async (c) => {
  const { limit = 10, page = 1, ...q } = c.req.query();
  const allCookies = getCookie(c);
  const username = allCookies['username'];
  if (!username) {
    c.status(400);
    return c.json({ message: 'Invalid username' });
  }

  const creatorCampaigns = await getCreatorCampaigns(username, Number(page), Number(limit));
  return c.json({ message: 'All creator campaign', ...creatorCampaigns })
})

app.get('/campaigns/:campaignId/leader-board', validationMiddleware(leaderBoardValidation), async (c) => {
  const { campaignId } = c.req.param();
  const { limit = 10, page = 1, ...q } = c.req.query();
  
  const leaderBoard = await getCampaignLeaderBoard(campaignId, Number(page), Number(limit));
  return c.json({ message: 'Campaign Leader board', ...leaderBoard });
})


connectToMongoDB(MONGO_DB_URI!, () => {
  console.log(`Server is running on port ${PORT}`)
  serve({
    fetch: app.fetch,
    port: Number(PORT)
  })
})
