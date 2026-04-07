import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarEvent } from "@/data/calendarData";
import { Cake, CalendarCheck, Flag } from "lucide-react";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CalendarGrid = ({ currentDate, events, selectedDate, onSelectDate }: CalendarGridProps) => {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { locale: ptBR });
    const end = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-secondary/50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const selected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`
                relative min-h-[100px] border-t border-r border-border p-2 text-left transition-all duration-150
                hover:bg-accent/50
                ${!inMonth ? "opacity-30" : ""}
                ${selected ? "bg-primary/5 ring-2 ring-inset ring-primary/30" : ""}
                ${idx % 7 === 0 ? "border-l-0" : ""}
              `}
            >
              <span
                className={`
                  inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium
                  ${today ? "bg-primary text-primary-foreground" : "text-foreground"}
                `}
              >
                {format(day, "d")}
              </span>

              {/* Event indicators */}
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`
                      flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight truncate
                      ${
                        event.type === "birthday"
                          ? "bg-calendar-birthday/15 text-calendar-birthday"
                          : event.type === "holiday"
                          ? "bg-calendar-holiday/15 text-calendar-holiday"
                          : "bg-calendar-event/15 text-calendar-event"
                      }
                    `}
                  >
                    {event.type === "birthday" ? (
                      <Cake className="h-3 w-3 flex-shrink-0" />
                    ) : event.type === "holiday" ? (
                      <Flag className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <CalendarCheck className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {event.type === "birthday" ? event.personName : event.title}
                    </span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
