import { MessageSquare, Cake, CalendarHeart, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const cards = [
  { title: "Conexão WhatsApp", desc: "Configure e gerencie a conexão do dispositivo", icon: Smartphone, to: "/whatsapp/conexao" },
  { title: "Aniversariantes", desc: "Gerencie parabéns automáticos para a equipe", icon: Cake, to: "/whatsapp/aniversariantes" },
  { title: "Disparos Sazonais", desc: "Agende campanhas para datas comemorativas", icon: CalendarHeart, to: "/whatsapp/sazonais" },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo ao Marketing Hub</h1>
        <p className="text-muted-foreground mt-1">Painel centralizado de automação de marketing da Tecfag.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(c.to)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <c.icon className="h-5 w-5 text-primary" />
                {c.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
