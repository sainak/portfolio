import type { APIRoute } from "astro"

export const GET: APIRoute = () => {
  return fetch("https://sainak.github.io/resume/resume.pdf")
    .then((res) => {
      if (res.status !== 200) {
        throw new Error("Not found")
      }
      return res
    })
    .catch((err) => {
      console.error(err)
      return new Response("Internal server error", { status: 500 })
    })
}
