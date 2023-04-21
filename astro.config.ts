import { defineConfig } from "astro/config"
import preact from "@astrojs/preact"
import tailwind from "@astrojs/tailwind"
import vercel from "@astrojs/vercel/serverless"

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [preact(), tailwind()],
  adapter: vercel({
    analytics: true
  }),
})
