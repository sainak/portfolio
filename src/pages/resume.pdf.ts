import type { APIRoute } from "astro"

export const get: APIRoute = async function get() {
  return fetch("https://sainak.github.io/resume/resume.pdf")
    .then((res) => {
      if (res.status === 200) {
        return res
      }
      return new Response("Not found", { status: 404 })
    })
    .catch((err) => {
      console.error(err)
      return new Response("Internal server error", { status: 500 })
    })
}
