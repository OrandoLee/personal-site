import type { LabProject } from "@/data/lab";
import { fetchGitHubRepoTimes } from "@/lib/github-repo";

function githubSourceUrl(project: LabProject) {
  return project.githubRepoUrl ?? project.externalUrl ?? null;
}

export async function enrichLabProjectWithGitHubTimes(project: LabProject) {
  const times = await fetchGitHubRepoTimes(githubSourceUrl(project));

  if (!times) {
    return project;
  }

  return {
    ...project,
    ...times
  };
}

export async function enrichLabProjectsWithGitHubTimes(projects: LabProject[]) {
  return Promise.all(projects.map((project) => enrichLabProjectWithGitHubTimes(project)));
}
