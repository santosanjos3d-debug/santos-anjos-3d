import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ImagePlus, Package, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type ProductSize = { size: string; label: string; price: string };
type ProductColor = { name: string; value: string; image: string };

type ProductForm = {
  name: string;
  description: string;
  details: string;
  category: string;
  image: string;
  price: string;
  widthCm: string;
  heightCm: string;
  lengthCm: string;
  weightGrams: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  active: number;
  sortOrder: string;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  details: "",
  category: "",
  image: "",
  price: "",
  widthCm: "",
  heightCm: "",
  lengthCm: "",
  weightGrams: "",
  sizes: [
    { size: "P", label: "Pequeno (144mm)", price: "" },
    { size: "M", label: "Médio (216mm)", price: "" },
    { size: "G", label: "Grande (288mm)", price: "" },
  ],
  colors: [
    { name: "Branco", value: "white", image: "" },
    { name: "Marrom", value: "brown", image: "" },
    { name: "Verde", value: "green", image: "" },
  ],
  active: 1,
  sortOrder: "0",
};

export default function AdminProducts() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [products, setProducts] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingColorIdx, setUploadingColorIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  }

  function openEdit(product: any) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      details: product.details || "",
      category: product.category || "",
      image: product.image || "",
      price: product.price || "",
      widthCm: product.widthCm || "",
      heightCm: product.heightCm || "",
      lengthCm: product.lengthCm || "",
      weightGrams: product.weightGrams ? String(product.weightGrams) : "",
      sizes: product.sizes
        ? (Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes))
        : EMPTY_FORM.sizes,
      colors: product.colors
        ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors))
        : EMPTY_FORM.colors,
      active: product.active ?? 1,
      sortOrder: product.sortOrder ? String(product.sortOrder) : "0",
    });
    setIsFormOpen(true);
  }

  async function handleImageUpload(file: File, onUrl: (url: string) => void) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            base64Data: base64,
          }),
          credentials: 'include',
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Erro no upload');
        onUrl(result.url);
      } catch (err: any) {
        toast.error("Erro no upload: " + err.message);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    await handleImageUpload(file, (url) => {
      setForm((f) => ({ ...f, image: url }));
      setUploadingImage(false);
    });
  }

  async function handleColorImageUpload(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingColorIdx(idx);
    await handleImageUpload(file, (url) => {
      setForm((f) => {
        const colors = [...f.colors];
        colors[idx] = { ...colors[idx], image: url };
        return { ...f, colors };
      });
      setUploadingColorIdx(null);
    });
  }

  function updateSize(idx: number, field: keyof ProductSize, value: string) {
    setForm((f) => {
      const sizes = [...f.sizes];
      sizes[idx] = { ...sizes[idx], [field]: value };
      return { ...f, sizes };
    });
  }

  function updateColor(idx: number, field: keyof ProductColor, value: string) {
    setForm((f) => {
      const colors = [...f.colors];
      colors[idx] = { ...colors[idx], [field]: value };
      return { ...f, colors };
    });
  }

  function addSize() {
    setForm((f) => ({ ...f, sizes: [...f.sizes, { size: "", label: "", price: "" }] }));
  }

  function removeSize(idx: number) {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, i) => i !== idx) }));
  }

  function addColor() {
    setForm((f) => ({ ...f, colors: [...f.colors, { name: "", value: "", image: "" }] }));
  }

  function removeColor(idx: number) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit() {
    setIsSaving(true);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      details: form.details || undefined,
      category: form.category || undefined,
      image: form.image || undefined,
      price: form.price,
      widthCm: form.widthCm || undefined,
      heightCm: form.heightCm || undefined,
      lengthCm: form.lengthCm || undefined,
      weightGrams: form.weightGrams ? parseInt(form.weightGrams) : undefined,
      sizes: form.sizes.length > 0 ? JSON.stringify(form.sizes) : undefined,
      colors: form.colors.length > 0 ? JSON.stringify(form.colors) : undefined,
      active: form.active,
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      let res: Response;
      if (editingId !== null) {
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      }
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao salvar produto');
      await fetchProducts();
      setIsFormOpen(false);
      toast.success(editingId ? "Produto atualizado!" : "Produto criado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir');
      }
      await fetchProducts();
      setDeletingId(null);
      toast.success("Produto excluído.");
    } catch (err: any) {
      toast.error("Erro ao excluir: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Gestão de Produtos</h1>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {!products || products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nenhum produto cadastrado.</p>
            <Button onClick={openCreate} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Produto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className={`overflow-hidden ${product.active === 0 ? 'opacity-60' : ''}`}>
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="w-12 h-12 opacity-30" />
                    </div>
                  )}
                  {product.active === 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="mb-2">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-primary">R$ {product.price}</span>
                    {product.weightGrams && (
                      <span className="text-xs text-muted-foreground">{product.weightGrams}g</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => openEdit(product)}
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeletingId(product.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Informações Básicas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nome do Produto *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: São Miguel Arcanjo"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Input
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      placeholder="Ex: Santos, Arcanjos, Nossa Senhora"
                    />
                  </div>
                  <div>
                    <Label>Preço Base (R$) *</Label>
                    <Input
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="Ex: 59.03"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Descrição Curta</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Descrição breve para o catálogo"
                      rows={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Detalhes Completos</Label>
                    <Textarea
                      value={form.details}
                      onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                      placeholder="Descrição detalhada para a página do produto"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={form.active === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, active: f.active === 1 ? 0 : 1 }))}
                      className="gap-1"
                    >
                      {form.active === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {form.active === 1 ? "Ativo" : "Inativo"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Ordem:</Label>
                    <Input
                      className="w-20"
                      value={form.sortOrder}
                      onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imagem Principal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Imagem Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {form.image ? (
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImagePlus className="w-8 h-8 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleMainImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="gap-2"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {uploadingImage ? "Enviando..." : "Fazer Upload"}
                    </Button>
                    <p className="text-xs text-muted-foreground">ou cole a URL da imagem:</p>
                    <Input
                      value={form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      placeholder="https://... ou /images/..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensões e Peso */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Dimensões e Peso (para cálculo de frete)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Largura (cm)</Label>
                    <Input
                      value={form.widthCm}
                      onChange={(e) => setForm((f) => ({ ...f, widthCm: e.target.value }))}
                      placeholder="8"
                      type="number"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Altura (cm)</Label>
                    <Input
                      value={form.heightCm}
                      onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
                      placeholder="15"
                      type="number"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Comprimento (cm)</Label>
                    <Input
                      value={form.lengthCm}
                      onChange={(e) => setForm((f) => ({ ...f, lengthCm: e.target.value }))}
                      placeholder="8"
                      type="number"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Peso (gramas)</Label>
                    <Input
                      value={form.weightGrams}
                      onChange={(e) => setForm((f) => ({ ...f, weightGrams: e.target.value }))}
                      placeholder="150"
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tamanhos */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Tamanhos e Preços</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSize} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.sizes.map((size, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      className="w-16"
                      value={size.size}
                      onChange={(e) => updateSize(idx, "size", e.target.value)}
                      placeholder="P"
                    />
                    <Input
                      className="flex-1"
                      value={size.label}
                      onChange={(e) => updateSize(idx, "label", e.target.value)}
                      placeholder="Pequeno (144mm)"
                    />
                    <Input
                      className="w-28"
                      value={size.price}
                      onChange={(e) => updateSize(idx, "price", e.target.value)}
                      placeholder="R$ 59.03"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive flex-shrink-0"
                      onClick={() => removeSize(idx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cores */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Cores e Imagens por Cor</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addColor} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.colors.map((color, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        className="flex-1"
                        value={color.name}
                        onChange={(e) => updateColor(idx, "name", e.target.value)}
                        placeholder="Nome (ex: Branco)"
                      />
                      <Input
                        className="w-28"
                        value={color.value}
                        onChange={(e) => updateColor(idx, "value", e.target.value)}
                        placeholder="Valor (white)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive flex-shrink-0"
                        onClick={() => removeColor(idx)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        {color.image ? (
                          <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImagePlus className="w-4 h-4 opacity-30" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { colorFileInputRefs.current[idx] = el; }}
                        className="hidden"
                        onChange={(e) => handleColorImageUpload(idx, e)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => colorFileInputRefs.current[idx]?.click()}
                        disabled={uploadingColorIdx === idx}
                        className="gap-1"
                      >
                        <ImagePlus className="w-3 h-3" />
                        {uploadingColorIdx === idx ? "Enviando..." : "Upload"}
                      </Button>
                      <Input
                        className="flex-1"
                        value={color.image}
                        onChange={(e) => updateColor(idx, "image", e.target.value)}
                        placeholder="URL da imagem desta cor"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSaving || !form.name || !form.price}>
              {isSaving ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingId !== null && handleDelete(deletingId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
