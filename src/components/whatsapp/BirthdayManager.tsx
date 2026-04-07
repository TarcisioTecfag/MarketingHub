import { useState } from "react";
import { Plus, Pencil, Trash2, Cake, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockBirthdays, type Birthday } from "@/data/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusBadge: Record<Birthday["status"], { label: string; variant: "default" | "secondary" | "destructive" }> = {
  enviado: { label: "Enviado", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  erro: { label: "Erro", variant: "destructive" },
};

function BirthdayForm({ initial, onSave, onCancel }: { initial?: Birthday; onSave: (b: Omit<Birthday, "id" | "status">) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [preview, setPreview] = useState<string | null>(initial?.imageUrl ?? null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do Funcionário</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria Oliveira" />
      </div>
      <div className="space-y-2">
        <Label>Data de Nascimento</Label>
        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Mensagem Personalizada</Label>
        <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem de parabéns..." />
      </div>
      <div className="space-y-2">
        <Label>Foto do Funcionário</Label>
        <Input type="file" accept="image/*" onChange={handleImage} />
        {preview && <img src={preview} alt="Preview" className="mt-2 h-32 w-32 rounded-lg object-cover border" />}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave({ name, birthDate, message, imageUrl: preview })} disabled={!name || !birthDate}>Salvar</Button>
      </div>
    </div>
  );
}

export function BirthdayManager() {
  const [items, setItems] = useState<Birthday[]>(mockBirthdays);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Birthday | undefined>();

  const filtered = items.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (data: Omit<Birthday, "id" | "status">) => {
    if (editing) {
      setItems((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...data } : b)));
    } else {
      setItems((prev) => [...prev, { ...data, id: String(Date.now()), status: "pendente" }]);
    }
    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = (id: string) => setItems((prev) => prev.filter((b) => b.id !== id));

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Aniversariantes</h1>
          <p className="text-muted-foreground mt-1">Gerencie os parabéns automáticos no grupo Tecfag.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Aniversariante</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Aniversariante" : "Cadastrar Aniversariante"}</DialogTitle>
            </DialogHeader>
            <BirthdayForm initial={editing} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditing(undefined); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Cake className="h-5 w-5 text-primary" />
              Lista de Aniversariantes ({items.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Nascimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => {
                const badge = statusBadge[b.status];
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{formatDate(b.birthDate)}</TableCell>
                    <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum aniversariante encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
