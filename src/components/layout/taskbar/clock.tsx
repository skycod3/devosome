import { useEffect, useState } from "react";
import { format } from "date-fns";

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // calculate milliseconds until next minute
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // sync to start of next minute
    const syncTimeout = setTimeout(() => {
      setTime(new Date());

      // then update every minute
      interval = setInterval(() => setTime(new Date()), 60 * 1000);
    }, msUntilNextMinute);

    // cleanup both timeout and interval
    return () => {
      clearTimeout(syncTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <p>
      {format(time, "EEE")} {format(time, "HH:mm")}
    </p>
  );
}
