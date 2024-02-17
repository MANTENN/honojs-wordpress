import { Hono } from 'hono'
import { renderer } from './renderer'
import { Suspense } from 'hono/jsx'

import { sql } from 'drizzle-orm'
import { PlanetScaleDatabase, drizzle } from "drizzle-orm/planetscale-serverless";
import { ExecutedQuery, connect } from "@planetscale/database";

type Bindings = {
  DATABASE_HOST: string
  DATABASE_USERNAME: string
  DATABASE_PASSWORD: string
}
type Variables = {
  db: PlanetScaleDatabase
}

async function AsyncComponentTwo({ content = "Oops", db, first = 1, offset, mockLatency = 1 }: { content: string, db: PlanetScaleDatabase<Record<string, never>>, first?: number, offset: number, mockLatency?: number }) {
  await new Promise((resolve) => setTimeout(resolve, mockLatency * 1000))
  const posts: any[] = (await db.execute(sql`SELECT post_title, post_name as slug, wp_users.user_nicename as username FROM wp_posts left join wp_users on wp_posts.post_author = wp_users.id WHERE wp_posts.post_type = 'post' and wp_posts.post_status = 'publish' limit ${first} offset ${offset};`)).rows;
  return (<>
    {posts.map((post) => <a href={post.slug}><h1>{post.post_title}</h1></a>)}
  </>)
}
async function AsyncComponent({ content = "Oops2", db, first = 1, offset }: { content: string, db: PlanetScaleDatabase<Record<string, never>>, first?: number, offset: number }) {
  await new Promise((resolve) => setTimeout(resolve, 4000))
  const posts: any[] = (await db.execute(sql`SELECT post_title, post_name as slug, wp_users.user_nicename as username FROM wp_posts left join wp_users on wp_posts.post_author = wp_users.id WHERE wp_posts.post_type = 'post' and wp_posts.post_status = 'publish' limit ${first} offset ${offset};`)).rows;
  return (<>
    {posts.map((post) => <a href={post.slug}><h1>{post.post_title}</h1></a>)}
  </>)
}

async function PostContent({ data }: { data: Promise<ExecutedQuery> }) {
  const content = (await data).rows[0]
  return (<>
    <h1>{content.post_title}</h1>
    <div dangerouslySetInnerHTML={{ __html: content.post_content }} />
  </>)
}


const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()
app.use(async (c, next) => {
  const mysqlConnection = connect({
    host: c.env.DATABASE_HOST,
    username: c.env.DATABASE_USERNAME,
    password: c.env.DATABASE_PASSWORD,
  });

  c.set('db', drizzle(mysqlConnection));
  await next()
})

app.get('*', renderer)

app.get('/', async (c) => {
  const db = c.get('db')
  return c.render(
    <>
      <Suspense fallback={<h1>1</h1>}>
        <AsyncComponentTwo content={"Out"} db={db} first={1} offset={0} />
      </Suspense>
      <Suspense fallback={<h1>2</h1>} >
        <AsyncComponent content={"Of"} db={db} offset={2} />
      </Suspense>
      <Suspense fallback={<h1>3</h1>}>
        <AsyncComponentTwo content={"Order"} db={db} offset={1} mockLatency={2} />
      </Suspense>
    </>,
    {
      title: "out of order home"
    }
  )
})

app.get('/posts', async (c) => {
  const db = c.get('db')
  return c.json((await db.execute(sql`SELECT post_title, post_name as slug, wp_users.user_nicename as username FROM wp_posts left join wp_users on wp_posts.post_author = wp_users.id WHERE wp_posts.post_type = 'post' and wp_posts.post_status = 'publish' limit 100;`)).rows, 200)
})

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const db = c.get('db')
  const content = db.execute(sql`SELECT post_title, post_content, post_name as slug, wp_users.user_nicename as username FROM wp_posts left join wp_users on wp_posts.post_author = wp_users.id WHERE wp_posts.post_name = ${slug} AND wp_posts.post_type = 'post' and wp_posts.post_status = 'publish' limit 1;`)

  return c.render(
    <Suspense fallback={<h1>FETCHING POST</h1>}>
      <PostContent data={content} />
    </Suspense>
  )
})

export default app
