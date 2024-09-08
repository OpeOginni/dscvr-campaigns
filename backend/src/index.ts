import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger'
import { connectToMongoDB } from './database/mongoose.connection';
import { createCampaignMiddleware, getCampaignMiddleware } from './campaigns/campaign.validation';
import { createCampaign, getCampaigns, getCreatorCampaigns } from './campaigns/campaign.service';
import { getCookie } from 'hono/cookie';

const app = new Hono()

app.use('*', cors())
app.use(logger())

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.post('/campaigns', createCampaignMiddleware, async (c) => {
  const body = await c.req.json();
  const newCampaign = await createCampaign(body);
  return c.json({ message: 'Campaign created successfully', data: newCampaign })
})

app.get('/campaigns', getCampaignMiddleware, async (c) => {
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

app.get('/campaigns/creators', async (c) => {
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

app.get('/campaigns/leader-board', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

const port = 3000
connectToMongoDB('mongodb://localhost:27017/hono', () => {
  console.log(`Server is running on port ${port}`)
  serve({
    fetch: app.fetch,
    port
  })
})
