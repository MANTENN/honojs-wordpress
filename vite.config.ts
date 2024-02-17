import { getEnv } from '@hono/vite-dev-server/cloudflare-pages'

import build from '@hono/vite-cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig, loadEnv } from 'vite'

export default ({ mode }: { mode: any }) => {
  const ENV_VARIABLES = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, ENV_VARIABLES)
  return defineConfig({
    plugins: [
      build(),
      devServer({
        env: getEnv({
          bindings: {
            ...loadEnv(mode, process.cwd(), '')
          },
        }),
        entry: 'src/index.tsx'
      })
    ]
  })
}