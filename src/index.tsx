import { Hono } from 'hono'
import { renderer } from './renderer'
import { Suspense } from 'hono/jsx'

async function AsyncComponentTwo({ content = "Oops" }) {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return <h1>{content}</h1>
}
async function AsyncComponent({ content = "Oops2" }) {
  await new Promise((resolve) => setTimeout(resolve, 4000))
  return <h1>{content}</h1>
}


const app = new Hono()

app.get('*', renderer)

app.get('/', (c) => {
  return c.render(
    <>
      <Suspense fallback={<h1>1</h1>}>
        <AsyncComponentTwo content={"Out"} />
      </Suspense>
      <Suspense fallback={<h1>2</h1>}>
        <AsyncComponent content={"Of"} />
      </Suspense>
      <Suspense fallback={<h1>3</h1>}>
        <AsyncComponentTwo content={"Order"} />
      </Suspense>
    </>
  )
})

app.get('/stream', (c) => {
  return c.render(
    <Suspense fallback={<h1>Partial Streaming</h1>}>
      <AsyncComponent />
    </Suspense>
  )
})

export default app
