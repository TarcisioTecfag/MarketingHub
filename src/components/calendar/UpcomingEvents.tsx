import { useMemo } from "react";
import { format, isAfter, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cake, CalendarCheck, Clock, Flag } from "lucide-react";
import type { CalendarEvent } from "@/data/calendarData";

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => {
        const d = new Date(e.date);
        return isAfter(d, now) || isSameDay(d, now);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  }, [events]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">Próximos Eventos</h3>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum evento próximo encontrado.</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((event, idx) => (
            <div
              key={event.id}
              className={`
                flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/30
                ${idx === 0 ? "ring-2 ring-primary/20 bg-primary/5" : ""}
              `}
            >
              <div
                className={`
                  flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg
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
                  <Cake className="h-5 w-5" />
                ) : event.type === "holiday" ? (
                  <Flag className="h-5 w-5" />
                ) : (
                  <CalendarCheck className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-card-foreground truncate">{event.title}</h4>
                  {idx === 0 && (
                    <span className="flex-shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      Próximo
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {format(new Date(event.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
