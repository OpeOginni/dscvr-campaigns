import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.post('/campaigns', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.get('/campaigns', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.patch('/campaigns', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.get('/campaigns/creators', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.get('/campaigns/leader-board', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
