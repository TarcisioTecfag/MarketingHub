// ─── Types ───────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  type: "event" | "birthday" | "holiday";
  description?: string;
  personName?: string;
}

// ── Brazilian National Holidays (fixed dates, valid every year) ──
function getBrazilHolidays(year: number): CalendarEvent[] {
  return [
    { id: `h-confra-${year}`, title: "Confraternização Universal", date: new Date(year, 0, 1).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-tiradentes-${year}`, title: "Tiradentes", date: new Date(year, 3, 21).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-trabalho-${year}`, title: "Dia do Trabalho", date: new Date(year, 4, 1).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-independencia-${year}`, title: "Independência do Brasil", date: new Date(year, 8, 7).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-aparecida-${year}`, title: "Nossa Sra. Aparecida", date: new Date(year, 9, 12).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-finados-${year}`, title: "Finados", date: new Date(year, 10, 2).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-republica-${year}`, title: "Proclamação da República", date: new Date(year, 10, 15).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-consciencia-${year}`, title: "Dia da Consciência Negra", date: new Date(year, 10, 20).toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-natal-${year}`, title: "Natal", date: new Date(year, 11, 25).toISOString(), type: "holiday", description: "Feriado Nacional" },
  ];
}

// ── São Paulo State/City Holidays ──
function getSaoPauloHolidays(year: number): CalendarEvent[] {
  return [
    { id: `h-revconst-${year}`, title: "Revolução Constitucionalista", date: new Date(year, 6, 9).toISOString(), type: "holiday", description: "Feriado Estadual - São Paulo" },
    { id: `h-anivsp-${year}`, title: "Aniversário de São Paulo", date: new Date(year, 0, 25).toISOString(), type: "holiday", description: "Feriado Municipal - São Paulo" },
  ];
}

// ── Easter-based moveable holidays (Computus algorithm) ──
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getMoveableHolidays(year: number): CalendarEvent[] {
  const easter = getEasterDate(year);
  const msPerDay = 86400000;

  const carnival1 = new Date(easter.getTime() - 48 * msPerDay);
  const carnival2 = new Date(easter.getTime() - 47 * msPerDay);
  const goodFriday = new Date(easter.getTime() - 2 * msPerDay);
  const corpusChristi = new Date(easter.getTime() + 60 * msPerDay);

  return [
    { id: `h-carnaval1-${year}`, title: "Carnaval", date: carnival1.toISOString(), type: "holiday", description: "Ponto Facultativo" },
    { id: `h-carnaval2-${year}`, title: "Carnaval", date: carnival2.toISOString(), type: "holiday", description: "Ponto Facultativo" },
    { id: `h-paixao-${year}`, title: "Paixão de Cristo", date: goodFriday.toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-pascoa-${year}`, title: "Páscoa", date: easter.toISOString(), type: "holiday", description: "Feriado Nacional" },
    { id: `h-corpus-${year}`, title: "Corpus Christi", date: corpusChristi.toISOString(), type: "holiday", description: "Ponto Facultativo" },
  ];
}

// Generate holidays for a range of years
function generateAllHolidays(): CalendarEvent[] {
  const holidays: CalendarEvent[] = [];
  for (let year = 2024; year <= 2035; year++) {
    holidays.push(
      ...getBrazilHolidays(year),
      ...getSaoPauloHolidays(year),
      ...getMoveableHolidays(year),
    );
  }
  return holidays;
}

export const holidays = generateAllHolidays();

/**
 * Convert birthdays from the BirthdayManager API into CalendarEvents.
 * Each birthday repeats every year — we generate events for the current
 * and next year so they always appear in the calendar.
 */
export function birthdaysToEvents(
  birthdays: Array<{ id: string; name: string; birthDate: string }>
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const years = [new Date().getFullYear(), new Date().getFullYear() + 1];

  for (const b of birthdays) {
    // birthDate is stored as "YYYY-MM-DD"
    const parts = b.birthDate.split("-");
    if (parts.length !== 3) continue;
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);

    for (const year of years) {
      events.push({
        id: `birthday-${b.id}-${year}`,
        title: `Aniversário - ${b.name}`,
        date: new Date(year, month, day).toISOString(),
        type: "birthday",
        personName: b.name,
        description: `Parabéns, ${b.name}!`,
      });
    }
  }

  return events;
}

/**
 * Convert seasonal campaigns from the SeasonalCampaigns API into CalendarEvents.
 */
export function campaignsToEvents(
  campaigns: Array<{ id: string; name: string; scheduledDate?: string; date?: string; description?: string }>
): CalendarEvent[] {
  return campaigns
    .filter((c) => c.scheduledDate || c.date)
    .map((c) => ({
      id: `campaign-${c.id}`,
      title: c.name,
      date: (c.scheduledDate || c.date)!,
      type: "event" as const,
      description: c.description,
    }));
}
