import { initAuthCreds, BufferJSON, AuthenticationState } from "@whiskeysockets/baileys";
import { PrismaClient } from "@prisma/client";

export const usePrismaAuthState = async (
  prisma: PrismaClient,
  sessionId: string
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const credsId = `creds-${sessionId}`;

  const readData = async (id: string) => {
    try {
      const data = await prisma.authState.findUnique({ where: { id } });
      if (data) {
        return JSON.parse(data.value, BufferJSON.reviver);
      }
      return null;
    } catch {
      return null;
    }
  };

  const writeData = async (id: string, data: any) => {
    const value = JSON.stringify(data, BufferJSON.replacer);
    await prisma.authState.upsert({
      where: { id },
      create: { id, value },
      update: { value },
    });
  };

  const removeData = async (id: string) => {
    try {
      await prisma.authState.delete({ where: { id } });
    } catch {}
  };

  const credsData = await readData(credsId);
  const creds = credsData || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [key: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = { ...value, transactionId: null };
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<any>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const dbId = `${category}-${id}`;
              if (value) {
                tasks.push(writeData(dbId, value));
              } else {
                tasks.push(removeData(dbId));
              }
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData(credsId, creds),
  };
};
