import { Hono } from 'hono'
import { renderer } from './renderer'
import { Suspense } from 'hono/jsx'
import { renderToReadableStream } from 'hono/jsx/streaming'


async function AsyncComponent() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return <h1>Fake async hahaha</h1>
}


const app = new Hono()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(
    <Suspense fallback={<h1>Hello!</h1>}>
      <AsyncComponent />
    </Suspense>
  )
})

app.get('/stream', async (c) => {
  const children = (
    <Suspense fallback={<h1>Partial Streaming</h1>}>
      <AsyncComponent />
    </Suspense>
  )
  const body = await c.render(children).body
  return c.body(body, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})

export default app
