export function isValidSummary(summary: unknown): summary is string {
  return typeof summary === "string" && summary.trim().length > 0;
}
