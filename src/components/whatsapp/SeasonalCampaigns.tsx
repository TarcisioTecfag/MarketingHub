import { useState } from "react";
import { Plus, Pencil, Trash2, CalendarHeart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockCampaigns, type SeasonalCampaign } from "@/data/mock-data";

const statusBadge: Record<SeasonalCampaign["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  agendado: { label: "Agendado", variant: "default" },
  enviado: { label: "Enviado", variant: "secondary" },
  rascunho: { label: "Rascunho", variant: "outline" },
};

function CampaignForm({ initial, onSave, onCancel }: { initial?: SeasonalCampaign; onSave: (c: Omit<SeasonalCampaign, "id" | "status">) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [preview, setPreview] = useState<string | null>(initial?.imageUrl ?? null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Título da Campanha</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Páscoa 2025" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data do Disparo</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Hora do Disparo</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mensagem</Label>
        <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem da campanha..." />
      </div>
      <div className="space-y-2">
        <Label>Imagem da Campanha</Label>
        <Input type="file" accept="image/*" onChange={handleImage} />
        {preview && <img src={preview} alt="Preview" className="mt-2 h-32 rounded-lg object-cover border" />}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave({ title, date, time, message, imageUrl: preview })} disabled={!title || !date}>Salvar</Button>
      </div>
    </div>
  );
}

export function SeasonalCampaigns() {
  const [items, setItems] = useState<SeasonalCampaign[]>(mockCampaigns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonalCampaign | undefined>();

  const handleSave = (data: Omit<SeasonalCampaign, "id" | "status">) => {
    if (editing) {
      setItems((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
    } else {
      setItems((prev) => [...prev, { ...data, id: String(Date.now()), status: "rascunho" }]);
    }
    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = (id: string) => setItems((prev) => prev.filter((c) => c.id !== id));

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Disparos Sazonais</h1>
          <p className="text-muted-foreground mt-1">Agende mensagens para datas comemorativas e avisos gerais no grupo Tecfag.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Campanha</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Campanha" : "Nova Campanha Sazonal"}</DialogTitle>
            </DialogHeader>
            <CampaignForm initial={editing} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditing(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((c) => {
          const badge = statusBadge[c.status];
          return (
            <Card key={c.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarHeart className="h-4 w-4 text-primary" />
                      {c.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(c.date)} às {c.time}
                    </CardDescription>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{c.message}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" />Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CalendarHeart className="h-12 w-12 opacity-20 mb-3" />
            <p>Nenhuma campanha cadastrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
