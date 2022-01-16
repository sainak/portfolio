// const githubApiProxyUrl = "http://127.0.0.1:8787"
const githubApiProxyUrl = "https://gh-repo-info.acash.workers.dev"


const generateCards = (repo) => {
  const [owner, name] = repo.nameWithOwner.split('/');

  const languagePills = repo.languages.edges.map(language => {
    return `<span class="pill" style="background-color:${language.node.color}60">${language.node.name}</span>`
  });

  const topicsPills = repo.repositoryTopics.nodes.map(topic => {
    return `<span class="pill">${topic.topic.name}</span>`
  });

  let card = document.createElement('div');
  card.classList.add('p-4', 'xl:w-1/4', 'md:w-1/2', 'sm:w-1/2', 'w-full');
  card.innerHTML = `
  <div class="repo-card">
    <a href="https://github.com/${owner}/${name}">
      <span class="text-xl">
        ${owner}/<span class="font font-bold">${name}</span>
      </span>
    </a>
    ${repo.homepageUrl
      ? `<a href="${repo.homepageUrl}"><i class="icon-link-ext-alt"></i></a>`
      : ''
    }

    ${repo.description
      ? `<p>${repo.description}</p>`
      : ''
    }

    <div class="flex flex-wrap mt-2 gap-2">
      ${languagePills.join('\n')}
    </div>
    ${repo.repositoryTopics.nodes.length > 0
      ? `<div class="flex flex-wrap mt-2 gap-2">
          ${topicsPills.join('\n')}
        </div>`
      : ''
    }
  </div>`;

  return card
}


const fetchRepos = async (requestBody) => {
  const response = await fetch(githubApiProxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: requestBody
  })
  const data = await response.json().catch(error => {
    console.error(error);
    return null;
  })
  return data
}

const requestBody = {
  repos: [
    "sainAk/expensinator",
    "flaam-org/flaam-api",
    "sainAk/fb-group-scraper",
    "sainAk/ecom",
    "sainAk/martial-arts-sim"
  ]
}


fetchRepos(JSON.stringify(requestBody)).then(data => {
  console.log(data);
  const container = document.getElementById('projects-container');
  for (var key of Object.keys(data.data)) {
    if (key === "rateLimit") continue;
    const repo = data.data[key];
    const card = generateCards(repo);
    container.appendChild(card);
  }
})