import { MessageSquare, Cake, CalendarHeart, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

const cards = [
  { title: "Conexão WhatsApp", desc: "Configure e gerencie a conexão do dispositivo", icon: Smartphone, to: "/whatsapp/conexao" },
  { title: "Aniversariantes", desc: "Gerencie parabéns automáticos para a equipe", icon: Cake, to: "/whatsapp/aniversariantes" },
  { title: "Disparos Sazonais", desc: "Agende campanhas para datas comemorativas", icon: CalendarHeart, to: "/whatsapp/sazonais" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardHome() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo ao Marketing Hub</h1>
        <p className="text-muted-foreground mt-1">Painel centralizado de automação de marketing da Tecfag.</p>
      </div>
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid gap-4 md:grid-cols-3"
      >
        {cards.map((c) => (
          <motion.div key={c.title} variants={itemVariants}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full" onClick={() => navigate(c.to)}>
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
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
