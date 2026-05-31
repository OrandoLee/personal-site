export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(`${date}T00:00:00`));
}

export function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      new Date(`${b.date}T00:00:00`).getTime() -
      new Date(`${a.date}T00:00:00`).getTime()
  );
}
