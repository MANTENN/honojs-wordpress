import { Hono } from 'hono'
import { renderer } from './renderer'
import { Suspense } from 'hono/jsx'

async function AsyncComponentTwo() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return <h1>Fake async hahaha</h1>
}
async function AsyncComponent() {
  await new Promise((resolve) => setTimeout(resolve, 4000))
  return <h1>Fake async hahaha</h1>
}


const app = new Hono()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(
    <>
      <Suspense fallback={<h1>Out!</h1>}>
        <AsyncComponentTwo />
      </Suspense>
      <Suspense fallback={<h1>Of!</h1>}>
        <AsyncComponent />
      </Suspense>
      <Suspense fallback={<h1>Order!</h1>}>
        <AsyncComponentTwo />
      </Suspense>
    </>
  )
})

app.get('/stream', async (c) => {
  const body = await c.render(
    <Suspense fallback={<h1>Partial Streaming</h1>}>
      <AsyncComponent />
    </Suspense>
  ).body
  return c.body(body, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    },
  })
})

export default app
