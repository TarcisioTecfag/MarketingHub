import cron from "node-cron";
import { prisma } from "./db";
import { waSocket, connectionStatus } from "./whatsapp";

// Função para pausar (delay aleatório entre 5 a 15 segundos)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getRandomDelay = () => Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;

export const startCronJobs = () => {
  // Roda todo dia as 08:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Iniciando rotina de checagem de disparos...", new Date());
    if (!waSocket || connectionStatus !== "connected") {
      console.log("WhatsApp não está conectado. Abortando execução do cron.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const [, currentMonth, currentDay] = todayStr.split("-");

    // === ANIVERSARIANTES ===
    const birthdays = await prisma.birthday.findMany({
      where: { status: { not: "enviado" } }
    });

    for (const b of birthdays) {
      const [, bMonth, bDay] = b.birthDate.split("-");
      if (bMonth === currentMonth && bDay === currentDay) {
        try {
          const finalMessage = b.message.replace(/{nome}/g, b.name);
          
          if (b.imageBase64) {
             const buffer = Buffer.from(b.imageBase64.split(",")[1] || b.imageBase64, 'base64');
             await waSocket.sendMessage(b.groupId, { image: buffer, caption: finalMessage });
          } else {
             await waSocket.sendMessage(b.groupId, { text: finalMessage });
          }

          await prisma.birthday.update({ where: { id: b.id }, data: { status: "enviado" }});
          console.log(`Disparo enviado: Aniversariante ${b.name}`);
          
          // Delay de segurança
          await sleep(getRandomDelay());
        } catch (error) {
          console.error(`Erro ao disparar para ${b.name}`, error);
          await prisma.birthday.update({ where: { id: b.id }, data: { status: "erro" }});
        }
      }
    }

    // === SAZONAIS ===
    const seasonals = await prisma.seasonalCampaign.findMany({
      where: { status: { not: "enviado" }, sendDate: todayStr }
    });

    for (const s of seasonals) {
       try {
          if (s.imageBase64) {
             const buffer = Buffer.from(s.imageBase64.split(",")[1] || s.imageBase64, 'base64');
             await waSocket.sendMessage(s.groupId, { image: buffer, caption: s.message });
          } else {
             await waSocket.sendMessage(s.groupId, { text: s.message });
          }

          await prisma.seasonalCampaign.update({ where: { id: s.id }, data: { status: "enviado" }});
          console.log(`Disparo enviado: Sazonal ${s.title}`);
          
          await sleep(getRandomDelay());
       } catch (error) {
          console.error(`Erro ao disparar sazonal ${s.title}`, error);
          await prisma.seasonalCampaign.update({ where: { id: s.id }, data: { status: "erro" }});
       }
    }
  });

  console.log("✅ Rotinas Cron (Node-Cron) agendadas com sucesso.");
};
