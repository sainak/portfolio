import type { APIRoute } from "astro"

export const get: APIRoute = async function get() {
  try {
    let response = await fetch("https://sainak.github.io/resume/resume.pdf")
    response.headers.set("X-Robots-Tag", "noindex, nofollow")

    return response
  } catch (error: unknown) {
    throw new Error(`Something went wrong!: ${error as string}`)
  }
}
