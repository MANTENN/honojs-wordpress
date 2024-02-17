import { getEnv } from '@hono/vite-dev-server/cloudflare-pages'

import build from '@hono/vite-cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build(),
    devServer({
      env: getEnv({
        bindings: {
          DATABASE_HOST: 'aws.connect.psdb.cloud',
          DATABASE_USERNAME: 'chplmuv4upf2diop20te',
          DATABASE_PASSWORD: 'pscale_pw_FC3SVKn7H4ivjYrdHBftJcpLLUaqKpU46keMrxwNWuc',
        },
      }),
      entry: 'src/index.tsx'
    })
  ]
})
