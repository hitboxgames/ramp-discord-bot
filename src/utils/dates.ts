import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMinute,
  subMinutes,
} from "date-fns";

interface DateRange {
  fromDate: Date;
  toDate: Date;
}

export function getLastFiveMinutesRange() {
  const now = new Date();
  const start = startOfMinute(subMinutes(now, 5));
  const end = startOfMinute(now);

  return {
    fromDate: start,
    toDate: end,
  };
}

export function getTodayRange(): DateRange {
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());

  return {
    fromDate: start,
    toDate: end,
  };
}

export function getYesterdayRange(): DateRange {
  const yesterday = subDays(new Date(), 1);
  const start = startOfDay(yesterday);
  const end = endOfDay(yesterday);

  return {
    fromDate: start,
    toDate: end,
  };
}

export function getLastWeekRange(): DateRange {
  const start = startOfDay(subDays(new Date(), 7));
  const end = endOfDay(new Date());

  return {
    fromDate: start,
    toDate: end,
  };
}

export function getLastMonthRange(): DateRange {
  const start = startOfDay(subDays(new Date(), 30));
  const end = endOfDay(new Date());

  return {
    fromDate: start,
    toDate: end,
  };
}
