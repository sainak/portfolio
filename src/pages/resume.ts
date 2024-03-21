import type { APIRoute } from "astro"

export const GET: APIRoute = () => {
  return new Response(null, {
    status: 301,
    headers: {
      Location: "/resume.pdf",
      "Cache-Control": "public, max-age=604800, immutable",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })
}
