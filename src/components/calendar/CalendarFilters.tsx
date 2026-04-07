import { Cake, CalendarCheck, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarFiltersProps {
  filters: { birthday: boolean; event: boolean; holiday: boolean };
  onChange: (filters: { birthday: boolean; event: boolean; holiday: boolean }) => void;
}

const CalendarFilters = ({ filters, onChange }: CalendarFiltersProps) => {
  const toggle = (key: "birthday" | "event" | "holiday") =>
    onChange({ ...filters, [key]: !filters[key] });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={filters.birthday ? "default" : "outline"}
        size="sm"
        onClick={() => toggle("birthday")}
        className={filters.birthday ? "bg-calendar-birthday hover:bg-calendar-birthday/90 text-white" : ""}
      >
        <Cake className="h-4 w-4 mr-1.5" />
        Aniversariantes
      </Button>
      <Button
        variant={filters.event ? "default" : "outline"}
        size="sm"
        onClick={() => toggle("event")}
        className={filters.event ? "bg-calendar-event hover:bg-calendar-event/90 text-white" : ""}
      >
        <CalendarCheck className="h-4 w-4 mr-1.5" />
        Eventos
      </Button>
      <Button
        variant={filters.holiday ? "default" : "outline"}
        size="sm"
        onClick={() => toggle("holiday")}
        className={filters.holiday ? "bg-calendar-holiday hover:bg-calendar-holiday/90 text-white" : ""}
      >
        <Flag className="h-4 w-4 mr-1.5" />
        Feriados
      </Button>
    </div>
  );
};

export default CalendarFilters;
