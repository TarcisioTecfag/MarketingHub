import { useState, useCallback, useMemo } from "react";
import { addMonths, subMonths } from "date-fns";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import UpcomingEvents from "@/components/calendar/UpcomingEvents";
import CalendarFilters from "@/components/calendar/CalendarFilters";
import { holidays, birthdaysToEvents, campaignsToEvents } from "@/data/calendarData";
import { fetchApi } from "@/lib/api";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState({ birthday: true, event: true, holiday: true });

  const handlePrev = useCallback(() => setCurrentDate((d) => subMonths(d, 1)), []);
  const handleNext = useCallback(() => setCurrentDate((d) => addMonths(d, 1)), []);
  const handleToday = useCallback(() => setCurrentDate(new Date()), []);

  // ── Fetch birthdays from the real backend ──────────────────────────────────
  const { data: birthdaysRaw = [] } = useQuery<Array<{ id: string; name: string; birthDate: string }>>({
    queryKey: ["birthdays"],
    queryFn: () => fetchApi("/birthdays"),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  // ── Fetch seasonal campaigns ───────────────────────────────────────────────
  const { data: campaignsRaw = [] } = useQuery<Array<{ id: string; name: string; scheduledDate?: string; date?: string; description?: string }>>({
    queryKey: ["seasonal-campaigns"],
    queryFn: () => fetchApi("/seasonal-campaigns"),
    staleTime: 1000 * 60 * 5,
  });

  // ── Merge all events ───────────────────────────────────────────────────────
  const allEvents = useMemo(() => {
    const birthdayEvents = birthdaysToEvents(birthdaysRaw);
    const campaignEvents = campaignsToEvents(campaignsRaw);
    return [...birthdayEvents, ...campaignEvents, ...holidays];
  }, [birthdaysRaw, campaignsRaw]);

  const filteredEvents = allEvents.filter((e) => filters[e.type]);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Calendar className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-10">
            Visualize aniversariantes e eventos programados no calendário.
          </p>
        </div>
        <CalendarFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Calendar section */}
      <div className="space-y-4">
        <CalendarHeader
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
        />
        <CalendarGrid
          currentDate={currentDate}
          events={filteredEvents}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap">
        {filters.birthday && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-calendar-birthday" />
            <span className="text-sm text-muted-foreground">Aniversariantes</span>
          </div>
        )}
        {filters.event && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-calendar-event" />
            <span className="text-sm text-muted-foreground">Eventos</span>
          </div>
        )}
        {filters.holiday && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-calendar-holiday" />
            <span className="text-sm text-muted-foreground">Feriados</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Hoje</span>
        </div>
      </div>

      {/* Upcoming events */}
      <UpcomingEvents events={filteredEvents} />
    </div>
  );
};

export default CalendarPage;
