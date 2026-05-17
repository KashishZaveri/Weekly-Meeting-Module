export const generateWeekOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const weeks: string[] = [];
  for (let i = 1; i <= 52; i++) {
    const weekNum = i < 10 ? `0${i}` : `${i}`;
    weeks.push(`${currentYear} - ${weekNum}`);
  }
  return weeks;
};

