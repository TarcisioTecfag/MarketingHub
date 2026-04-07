export interface Birthday {
  id: string;
  name: string;
  birthDate: string;
  message: string;
  imageUrl: string | null;
  groupId: string;
  status: "pendente" | "enviado" | "erro";
}

export interface WhatsAppGroup {
  id: string;
  name: string;
}

export interface SeasonalCampaign {
  id: string;
  title: string;
  date: string;
  time: string;
  message: string;
  imageUrl: string | null;
  groupId: string;
  status: "agendado" | "enviado" | "rascunho";
}

export const mockGroups: WhatsAppGroup[] = [
  { id: "g1", name: "Tecfag - Geral" },
  { id: "g2", name: "Tecfag - Marketing" },
  { id: "g3", name: "Tecfag - RH" },
  { id: "g4", name: "Tecfag - Diretoria" },
];

export const mockBirthdays: Birthday[] = [
  {
    id: "1",
    name: "Maria Oliveira",
    birthDate: "1990-03-15",
    message: "🎉 Parabéns, Maria! A família Tecfag deseja a você um dia incrível. Que venham muitas realizações!",
    imageUrl: null,
    groupId: "g1",
    status: "enviado",
  },
  {
    id: "2",
    name: "Carlos Santos",
    birthDate: "1985-07-22",
    message: "🎂 Feliz Aniversário, Carlos! A equipe Tecfag celebra com você esse dia especial!",
    imageUrl: null,
    groupId: "g1",
    status: "pendente",
  },
  {
    id: "3",
    name: "Ana Paula Ferreira",
    birthDate: "1992-11-08",
    message: "🥳 Ana Paula, parabéns! A Tecfag deseja muita saúde e sucesso para você!",
    imageUrl: null,
    groupId: "g2",
    status: "pendente",
  },
  {
    id: "4",
    name: "João Pedro Lima",
    birthDate: "1988-01-30",
    message: "🎈 João Pedro, feliz aniversário! A Tecfag está feliz em tê-lo conosco. Aproveite o seu dia!",
    imageUrl: null,
    groupId: "g1",
    status: "erro",
  },
];

export const mockCampaigns: SeasonalCampaign[] = [
  {
    id: "1",
    title: "Páscoa 2025",
    date: "2025-04-20",
    time: "08:00",
    message: "🐣 A Tecfag deseja a todos uma Feliz Páscoa! Que esse dia seja repleto de amor e paz.",
    imageUrl: null,
    groupId: "g1",
    status: "agendado",
  },
  {
    id: "2",
    title: "Dia das Mães",
    date: "2025-05-11",
    time: "07:00",
    message: "💐 Feliz Dia das Mães! A Tecfag parabeniza todas as mães da nossa equipe.",
    imageUrl: null,
    groupId: "g2",
    status: "rascunho",
  },
  {
    id: "3",
    title: "Natal 2025",
    date: "2025-12-25",
    time: "00:01",
    message: "🎄 Feliz Natal! A família Tecfag deseja boas festas e um próspero Ano Novo!",
    imageUrl: null,
    groupId: "g1",
    status: "agendado",
  },
  {
    id: "4",
    title: "Aviso: Recesso de Final de Ano",
    date: "2025-12-22",
    time: "09:00",
    message: "📢 Informamos que a Tecfag estará em recesso do dia 23/12 até 02/01. Boas festas!",
    imageUrl: null,
    groupId: "g3",
    status: "rascunho",
  },
];
