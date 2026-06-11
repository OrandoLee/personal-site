const githubRepoUrlPattern =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/?#]+)(?:\.git)?(?:[/?#].*)?$/i;
const gitSshRepoUrlPattern =
  /^git@github\.com:([^/]+)\/([^/?#]+?)(?:\.git)?(?:[/?#].*)?$/i;
const ownerRepoPattern = /^([^/]+)\/([^/]+)$/;

export type GitHubRepoReference = {
  owner: string;
  repo: string;
  url: string;
};

export type GitHubRepoTimes = {
  githubRepoUrl: string;
  githubCreatedAt?: string;
  githubUpdatedAt?: string;
};

function normalizeRepoName(value: string) {
  return value.replace(/\.git$/i, "").trim();
}

export function parseGitHubRepoReference(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const sshMatch = trimmed.match(gitSshRepoUrlPattern);
  if (sshMatch) {
    const owner = sshMatch[1]?.trim();
    const repo = normalizeRepoName(sshMatch[2] ?? "");

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`
    } satisfies GitHubRepoReference;
  }

  const httpMatch = trimmed.match(githubRepoUrlPattern);
  if (httpMatch) {
    const owner = httpMatch[1]?.trim();
    const repo = normalizeRepoName(httpMatch[2] ?? "");

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`
    } satisfies GitHubRepoReference;
  }

  const ownerRepoMatch = trimmed.match(ownerRepoPattern);
  if (ownerRepoMatch) {
    const owner = ownerRepoMatch[1]?.trim();
    const repo = normalizeRepoName(ownerRepoMatch[2] ?? "");

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`
    } satisfies GitHubRepoReference;
  }

  return null;
}

export function getGitHubRepoReference(value: string | null | undefined) {
  return parseGitHubRepoReference(value);
}

export async function fetchGitHubRepoTimes(
  value: string | null | undefined
): Promise<GitHubRepoTimes | null> {
  const repo = parseGitHubRepoReference(value);

  if (!repo) {
    return null;
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "personal-site"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}`,
    {
      headers,
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    created_at?: string;
    pushed_at?: string;
  };

  return {
    githubRepoUrl: repo.url,
    githubCreatedAt:
      typeof data.created_at === "string" ? data.created_at : undefined,
    githubUpdatedAt:
      typeof data.pushed_at === "string" ? data.pushed_at : undefined
  };
}
