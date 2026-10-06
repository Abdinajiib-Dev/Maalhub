/**
 * Normalizes project objects to ensure consistent progress formatting
 * across the entire application, bridging the database's `current_progress` 
 * column with the frontend's `progress_percentage` expectation.
 */
export function normalizeProject(project) {
  if (!project) return project;

  let pct = 0;
  if (project.progress_percentage !== undefined && project.progress_percentage !== null) {
    pct = parseInt(project.progress_percentage, 10) || 0;
  } else if (project.current_progress) {
    const match = String(project.current_progress).match(/(\d+)/);
    if (match) {
      pct = parseInt(match[1], 10);
    }
  }

  const validProgress = Math.min(100, Math.max(0, pct));

  return {
    ...project,
    progress_percentage: validProgress,
    current_progress: `${validProgress}%`
  };
}

export function normalizeProjects(projects) {
  if (!Array.isArray(projects)) return [];
  return projects.map(normalizeProject);
}
