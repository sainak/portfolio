export type Repository = {
  name: string
  owner: {
    login: string
  }
  description: any
  openGraphImageUrl: string
  homepageUrl: string
  forkCount: number
  stargazerCount: number
  updatedAt: string
  licenseInfo: {
    spdxId: string
  }
  issues: {
    totalCount: number
  }
  languages: {
    totalSize: number
    edges: Array<{
      size: number
      node: {
        name: string
        color: string
      }
    }>
  }
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string
      }
    }>
  }
}

type GithubResponse = null | {
  data?: {
    [key: `repo${number}`]: Repository | null
    rateLimit?: {
      limit: number
      cost: number
      remaining: number
      resetAt: string
    }
  }
  errors?: Array<{
    type: string
    path: Array<string>
    locations: Array<{
      line: number
      column: number
    }>
    message: string
  }>
}

export async function getRepositories(repos: string[]) {
  let reposToQuery = repos.map((repo, index) => {
    let [owner, repoName] = repo.split("/")
    return `repo${
      index + 1
    }:repository(owner: "${owner}", name: "${repoName}") { ...repoProperties }`
  })

  const query = `
    fragment repoProperties on Repository {
      name
      owner {
        login
      }
      description
      openGraphImageUrl
      homepageUrl
      forkCount
      stargazerCount
      updatedAt
      licenseInfo {
        spdxId
      }
      issues(states:OPEN) {
        totalCount
      }
      languages(first: 100) {
        totalSize
        edges {
          size
          node {
            name
            color
          }
        }
      }
      repositoryTopics(first: 10) {
        nodes {
          topic {
            name
          }
        }
      }
    }
    {
      ${reposToQuery.join("\n")}
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }
    `

  const response = (await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "api.github.com",
      Accept: "*/*",
      "User-Agent": "GitHub-Portfolio",
      Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.log(await res.text())
        return null
      }
      return res.json()
    })
    .catch((err) => {
      console.log(err)
      return null
    })) as GithubResponse

  if (response?.errors) {
    console.log(response.errors)
  }

  console.log(response?.data?.rateLimit)

  delete response?.data?.rateLimit

  return Object.values(response?.data || []).filter(
    (repo) => repo !== null
  ) as Repository[]
}
