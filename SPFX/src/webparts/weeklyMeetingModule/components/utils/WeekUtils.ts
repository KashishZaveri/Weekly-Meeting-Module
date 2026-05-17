import dayjs from "dayjs";

export const getWeekStringFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const weekNum = Math.ceil((days + start.getDay() + 1) / 7);
  const formattedWeek = weekNum < 10 ? `0${weekNum}` : weekNum;
  return `${date.getFullYear()} - ${formattedWeek}`;
};

export const parseWeekNoFromString = (str: any): number => {
  const parts = String(str).split("-");
  return parts.length > 1 ? parseInt(parts[1].trim(), 10) : 0;
};

export const getWeekRange = (weekStr: string) => {
  const [year, week] = weekStr.split("-").map(Number);

  const firstDayOfYear = dayjs(`${year}-01-01`);

  const firstSunday =
    firstDayOfYear.day() === 0
      ? firstDayOfYear
      : firstDayOfYear.add(7 - firstDayOfYear.day(), "day");

  const start = firstSunday.add((week - 1) * 7, "day");

  const end = start.add(6, "day");

  return {
    start,
    end,
  };
};
