// const githubApiProxyUrl = "http://127.0.0.1:8787"
const githubApiProxyUrl = "https://gh-repo-info.acash.workers.dev";

const fetchRepos = async (requestBody) => {
  return await fetch(githubApiProxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestBody,
  });
};

const requestBody = {
  repos: [
    "sainAk/expensinator",
    "flaam-org/flaam-api",
    "sainAk/fb-group-scraper",
    "sainAk/ecom",
    "sainAk/martial-arts-sim",
  ],
};

let response = fetchRepos(JSON.stringify(requestBody));

const generateCards = (repo) => {
  const [owner, name] = repo.nameWithOwner.split("/");

  const repoUrl = `https://github.com/${owner}/${name}`;

  const languagesTotal = repo.languages.totalSize;

  //sort repo.languages.edges based on language.size
  const sortedLanguages = repo.languages.edges.sort((a, b) => b.size - a.size);

  const languageBar = sortedLanguages.map((language) => {
    const width = (language.size / languagesTotal) * 100;
    return `
    <a style="background-color:${language.node.color} !important;;width: ${width}%"
      href="${repoUrl}/search?l=${language.node.name}" ></a>
    `;
  });

  const topicsPills = repo.repositoryTopics.nodes.map((topic) => {
    const topicName = topic.topic.name;
    return `
      <a href="https://github.com/search?q=user%3A${owner}+${topicName}" class="pill">
        ${topicName}
      </a>
    `;
  });

  let card = document.createElement("div");
  card.classList.add("p-4", "xl:w-1/4", "md:w-1/2", "sm:w-1/2", "w-full");
  card.innerHTML = `
  <div class="rounded-lg bg-white">
    <div class="flex rounded-t-lg overflow-hidden h-2 mb-8">
      ${languageBar.join("\n")}
    </div>
    <div class="px-4 pb-6">
      <a href="${repoUrl}">
        <span class="text-xl">
          ${owner}/<span class="font font-bold">${name}</span>
        </span>
      </a>
      ${
        repo.homepageUrl
          ? `<a href="${repo.homepageUrl}"><i class="icon-link-ext-alt"></i></a>`
          : ""
      }

      ${repo.description ? `<p>${repo.description}</p>` : ""}

      ${
        repo.repositoryTopics.nodes.length > 0
          ? `<div class="flex flex-wrap mt-2 gap-2">
            ${topicsPills.join("\n")}
          </div>`
          : ""
      }
    </div>
  </div>`;

  return card;
};

window.addEventListener("load", (event) => {
  response
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const container = document.getElementById("projects-container");
      for (var key of Object.keys(data.data)) {
        if (key === "rateLimit") continue;
        const repo = data.data[key];
        const card = generateCards(repo);
        container.appendChild(card);
      }
    });
});
