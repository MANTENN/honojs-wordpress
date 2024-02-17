import { Hono } from 'hono'
import { renderer } from './renderer'
import { Suspense } from 'hono/jsx'

import { sql } from 'drizzle-orm'
import { PlanetScaleDatabase, drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";

type Bindings = {
  DATABASE_HOST: string
  DATABASE_USERNAME: string
  DATABASE_PASSWORD: string
}


async function AsyncComponentTwo({ content = "Oops", db, first = 1, offset }: { content: string, db: PlanetScaleDatabase<Record<string, never>>, first?: number, offset: number }) {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const posts: any[] = (await db.execute(sql`SELECT * FROM wp_posts limit ${first} OFFSET ${offset};`)).rows;
  return (<>
    {posts.map((post) => <h1>{post.post_title}</h1>)}
  </>)
}
async function AsyncComponent({ content = "Oops2", db, first = 1, offset }: { content: string, db: PlanetScaleDatabase<Record<string, never>>, first?: number, offset: number }) {
  await new Promise((resolve) => setTimeout(resolve, 4000))
  const posts: any[] = (await db.execute(sql`SELECT * FROM wp_posts limit ${first} OFFSET ${offset};`)).rows;
  return (<>
    {posts.map((post) => <h1>{post.post_title}</h1>)}
  </>)
}


const app = new Hono<{ Bindings: Bindings }>()

app.get('*', renderer)

app.get('/', async (c) => {
  const mysqlConnection = connect({
    host: c.env.DATABASE_HOST,
    username: c.env.DATABASE_USERNAME,
    password: c.env.DATABASE_PASSWORD,
  })

  const db = drizzle(mysqlConnection);

  return c.render(
    <>
      <Suspense fallback={<h1>1</h1>}>
        <AsyncComponentTwo content={"Out"} db={db} first={1} offset={0} />
      </Suspense>
      <Suspense fallback={<h1>2</h1>} >
        <AsyncComponent content={"Of"} db={db} offset={2} />
      </Suspense>
      <Suspense fallback={<h1>3</h1>}>
        <AsyncComponentTwo content={"Order"} db={db} offset={3} />
      </Suspense>
    </>,
    {
      title: "out of order home"
    }
  )
})

app.get('/stream', (c) => {
  const mysqlConnection = connect({
    host: c.env.DATABASE_HOST,
    username: c.env.DATABASE_USERNAME,
    password: c.env.DATABASE_PASSWORD,
  })

  const db = drizzle(mysqlConnection);

  return c.render(
    <Suspense fallback={<h1>Partial Streaming</h1>}>
      <AsyncComponent content={"Order"} db={db} offset={3} />
    </Suspense>
  )
})

export default app
