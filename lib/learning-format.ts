export function formatJapaneseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

export function formatShortDate(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return `${month}月${day}日`;
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}年${month}月`;
}

export function formatLearningPeriod(oldest?: string, latest?: string) {
  if (!oldest || !latest) return "記録なし";
  return `${formatShortDate(oldest)} — ${formatShortDate(latest)}`;
}
