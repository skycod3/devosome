import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function Clock() {
  const [time, setTime] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer hover:text-foreground/70 transition-colors">
          {format(time, "EEE")} {format(time, "HH:mm")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="end">
        <div className="px-4 pt-3 pb-1 text-center">
          <p className="text-sm font-medium">{format(time, "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Calendar
          mode="single"
          selected={time}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          showOutsideDays
          className="border-none"
        />
      </PopoverContent>
    </Popover>
  );
}
