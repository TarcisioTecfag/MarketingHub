import { useState } from "react";
import { Plus, Pencil, Trash2, Cake, Search, Users, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockBirthdays, mockGroups, type Birthday } from "@/data/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusBadge: Record<Birthday["status"], { label: string; variant: "default" | "secondary" | "destructive" }> = {
  enviado: { label: "Enviado", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  erro: { label: "Erro", variant: "destructive" },
};

function WhatsAppPreview({ message, imageUrl, groupName }: { message: string; imageUrl: string | null; groupName: string }) {
  return (
    <div className="flex flex-col h-full">
      <Label className="text-xs text-muted-foreground mb-2">Preview do WhatsApp</Label>
      <div className="flex-1 rounded-xl overflow-hidden border bg-[#e5ddd5] dark:bg-[#0b141a] flex flex-col">
        <div className="bg-[#075e54] dark:bg-[#1f2c34] text-white px-4 py-2.5 flex items-center gap-2 text-sm font-medium">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <span className="truncate">{groupName || "Selecione um grupo"}</span>
        </div>
        <div
          className="flex-1 p-3 flex flex-col justify-end min-h-0 overflow-y-auto"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {message || imageUrl ? (
            <div className="max-w-[85%] self-end">
              <div className="bg-[#dcf8c6] dark:bg-[#005c4b] rounded-lg shadow-sm overflow-hidden">
                {imageUrl && <img src={imageUrl} alt="Preview" className="w-full max-h-48 object-cover" />}
                {message && (
                  <p className="text-[13px] leading-relaxed px-2.5 py-1.5 text-[#111b21] dark:text-[#e9edef] whitespace-pre-wrap break-words">
                    {message}
                  </p>
                )}
                <div className="flex justify-end px-2 pb-1">
                  <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">
                    {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground/50 text-xs text-center gap-1 py-8">
              <ImageIcon className="h-8 w-8 opacity-30" />
              <span>Preencha os campos para<br />visualizar a preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BirthdayForm({ initial, onSave, onCancel }: { initial?: Birthday; onSave: (b: Omit<Birthday, "id" | "status">) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [groupId, setGroupId] = useState(initial?.groupId ?? "");

  const selectedGroup = mockGroups.find((g) => g.id === groupId);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <WhatsAppPreview message={message} imageUrl={imagePreview} groupName={selectedGroup?.name ?? ""} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nome do Funcionário</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria Oliveira" />
        </div>
        <div className="space-y-2">
          <Label>Grupo de Destino</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o grupo" />
            </SelectTrigger>
            <SelectContent>
              {mockGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={() => onSave({ name, birthDate, message, imageUrl: imagePreview, groupId })} disabled={!name || !birthDate || !groupId}>Salvar</Button>
        </div>
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

  const getGroupName = (groupId: string) => mockGroups.find((g) => g.id === groupId)?.name ?? "—";

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Aniversariantes</h1>
          <p className="text-muted-foreground mt-1">Gerencie os parabéns automáticos.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Aniversariante</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
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
                <TableHead>Nascimento</TableHead>
                <TableHead>Grupo</TableHead>
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
                    <TableCell className="text-muted-foreground text-sm">{getGroupName(b.groupId)}</TableCell>
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
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum aniversariante encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
