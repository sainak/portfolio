import type { APIRoute } from "astro"

export const get: APIRoute = async function get() {
  try {
    return fetch("https://sainak.github.io/resume/resume.pdf")
  } catch (error: unknown) {
    throw new Error(`Something went wrong!: ${error as string}`)
  }
}
