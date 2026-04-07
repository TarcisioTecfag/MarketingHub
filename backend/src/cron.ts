import cron from "node-cron";
import { prisma } from "./db";
import { waSocket, connectionStatus } from "./whatsapp";

// Delay aleatório entre 5 a 15 segundos para humanizar disparos
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getRandomDelay = () => Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;

/**
 * Normaliza horário "HH:MM" retornando { hour, minute } como strings zero-padded.
 * Se sendTime vier vazio/undefined, usa "08:00".
 */
function parseSendTime(sendTime?: string | null): { hour: string; minute: string } {
  const time = sendTime?.match(/^(\d{1,2}):(\d{2})$/);
  if (time) return { hour: time[1].padStart(2, "0"), minute: time[2] };
  return { hour: "08", minute: "00" };
}

export const startCronJobs = () => {
  // Roda a cada minuto e verifica quais disparos estão agendados para esse momento
  cron.schedule("* * * * *", async () => {
    if (!waSocket || connectionStatus !== "connected") return;

    const now = new Date();
    // Timezone Brasil (UTC-3). Railway roda em UTC, então ajustamos:
    const nowBR = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const todayStr = nowBR.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentHour = String(nowBR.getUTCHours()).padStart(2, "0");
    const currentMinute = String(nowBR.getUTCMinutes()).padStart(2, "0");
    const [, currentMonth, currentDay] = todayStr.split("-");

    console.log(`[Cron] Verificando disparos para ${todayStr} ${currentHour}:${currentMinute} (horário Brasília)`);

    // ── ANIVERSARIANTES ──────────────────────────────────────────────────────
    const birthdays = await prisma.birthday.findMany({
      where: { status: { not: "enviado" } },
    });

    for (const b of birthdays) {
      const [, bMonth, bDay] = b.birthDate.split("-");
      if (bMonth !== currentMonth || bDay !== currentDay) continue;

      const { hour, minute } = parseSendTime(b.sendTime);
      if (hour !== currentHour || minute !== currentMinute) continue;

      try {
        const finalMessage = b.message.replace(/{nome}/g, b.name);
        if (b.imageBase64) {
          const buffer = Buffer.from(b.imageBase64.split(",")[1] || b.imageBase64, "base64");
          await waSocket.sendMessage(b.groupId, { image: buffer, caption: finalMessage });
        } else {
          await waSocket.sendMessage(b.groupId, { text: finalMessage });
        }
        await prisma.birthday.update({ where: { id: b.id }, data: { status: "enviado" } });
        console.log(`[Cron] ✅ Aniversariante enviado: ${b.name}`);
        await sleep(getRandomDelay());
      } catch (error) {
        console.error(`[Cron] ❌ Erro ao disparar aniversariante ${b.name}`, error);
        await prisma.birthday.update({ where: { id: b.id }, data: { status: "erro" } });
      }
    }

    // ── SAZONAIS ────────────────────────────────────────────────────────────
    const seasonals = await prisma.seasonalCampaign.findMany({
      where: { status: { not: "enviado" }, sendDate: todayStr },
    });

    for (const s of seasonals) {
      const { hour, minute } = parseSendTime(s.sendTime);
      if (hour !== currentHour || minute !== currentMinute) continue;

      try {
        if (s.imageBase64) {
          const buffer = Buffer.from(s.imageBase64.split(",")[1] || s.imageBase64, "base64");
          await waSocket.sendMessage(s.groupId, { image: buffer, caption: s.message });
        } else {
          await waSocket.sendMessage(s.groupId, { text: s.message });
        }
        await prisma.seasonalCampaign.update({ where: { id: s.id }, data: { status: "enviado" } });
        console.log(`[Cron] ✅ Sazonal enviado: ${s.title}`);
        await sleep(getRandomDelay());
      } catch (error) {
        console.error(`[Cron] ❌ Erro ao disparar sazonal ${s.title}`, error);
        await prisma.seasonalCampaign.update({ where: { id: s.id }, data: { status: "erro" } });
      }
    }
  });

  console.log("✅ Rotinas Cron (Node-Cron) agendadas com sucesso — verificação por minuto ativada.");
};
