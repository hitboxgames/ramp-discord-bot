import { startOfDay, endOfDay, subDays } from "date-fns";

interface DateRange {
  fromDate: string;
  toDate: string;
}

export function getTodayRange(): DateRange {
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

export function getYesterdayRange(): DateRange {
  const yesterday = subDays(new Date(), 1);
  const start = startOfDay(yesterday);
  const end = endOfDay(yesterday);

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

export function getLastWeekRange(): DateRange {
  const start = startOfDay(subDays(new Date(), 7));
  const end = endOfDay(new Date());

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

export function getLastMonthRange(): DateRange {
  const start = startOfDay(subDays(new Date(), 30));
  const end = endOfDay(new Date());

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}
