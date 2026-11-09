export type Division = "portfolio" | "projects" | "playground";

export const divisionRoutes: Record<Division, string> = {
  portfolio: "/portfolio",
  projects: "/projects",
  playground: "/playground",
};

export function getDivision(pathname: string): Division {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  if (path === divisionRoutes.projects) return "projects";
  if (path === divisionRoutes.playground) return "playground";
  return "portfolio";
}
