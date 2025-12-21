import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Current time in IST (formatted string)
 * Example: "2025-12-14 14:32"
 */
export const nowIST = () => {
  return dayjs()
    .tz(IST_TIMEZONE)
    .format('YYYY-MM-DD HH:mm');
};

/**
 * Convert UTC / DB timestamp to IST string
 * Input: Date | ISO string | TIMESTAMPTZ
 * Output: "YYYY-MM-DD HH:mm"
 */
export const toIST = (date) => {
  if (!date) return null;

  return dayjs(date)
    .tz(IST_TIMEZONE)
    .format('YYYY-MM-DD HH:mm');
};

/**
 * Start of today in IST (for querying)
 * Output: Date (UTC instant)
 */
export const istStartOfDay = () => {
  return dayjs()
    .tz(IST_TIMEZONE)
    .startOf('day')
    .utc()
    .toDate();
};

/**
 * End of today in IST (for querying)
 * Output: Date (UTC instant)
 */
export const istEndOfDay = () => {
  return dayjs()
    .tz(IST_TIMEZONE)
    .endOf('day')
    .utc()
    .toDate();
};
