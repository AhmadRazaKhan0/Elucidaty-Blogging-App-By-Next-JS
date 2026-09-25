export const CATEGORIES = ["Technology", "Design", "Engineering", "Productivity", "Career", "Opinion"] as const;
export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 100);
