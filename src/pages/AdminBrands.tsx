import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useUpdateBrandOrder, DbBrand } from '@/hooks/useBrands';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';

const AdminBrands = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();
  const updateBrandOrder = useUpdateBrandOrder();

  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<DbBrand | null>(null);
  const [draggedBrand, setDraggedBrand] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      description: '',
    });
    setEditingBrand(null);
  };

  const openEditDialog = (brand: DbBrand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || '',
      description: brand.description || '',
    });
    setIsBrandDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    const brandData = {
      name: formData.name.trim(),
      logo: formData.logo || undefined,
      description: formData.description || undefined,
    };

    if (editingBrand) {
      await updateBrand.mutateAsync({ id: editingBrand.id, ...brandData });
    } else {
      await createBrand.mutateAsync(brandData);
    }

    setIsBrandDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand? Products linked to this brand will not be deleted.')) {
      await deleteBrand.mutateAsync(id);
    }
  };

  const moveBrandUp = (index: number) => {
    if (index === 0 || !brands) return;
    const newBrands = [...brands];
    [newBrands[index - 1], newBrands[index]] = [newBrands[index], newBrands[index - 1]];
    const updates = newBrands.map((brand, idx) => ({ id: brand.id, display_order: idx }));
    updateBrandOrder.mutate(updates);
  };

  const moveBrandDown = (index: number) => {
    if (!brands || index === brands.length - 1) return;
    const newBrands = [...brands];
    [newBrands[index], newBrands[index + 1]] = [newBrands[index + 1], newBrands[index]];
    const updates = newBrands.map((brand, idx) => ({ id: brand.id, display_order: idx }));
    updateBrandOrder.mutate(updates);
  };

  const handleDragStart = (brandId: string) => {
    setDraggedBrand(brandId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetBrandId: string) => {
    if (!draggedBrand || !brands || draggedBrand === targetBrandId) return;
    
    const draggedIndex = brands.findIndex(b => b.id === draggedBrand);
    const targetIndex = brands.findIndex(b => b.id === targetBrandId);
    
    const newBrands = [...brands];
    const [removed] = newBrands.splice(draggedIndex, 1);
    newBrands.splice(targetIndex, 0, removed);
    
    const updates = newBrands.map((brand, idx) => ({ id: brand.id, display_order: idx }));
    updateBrandOrder.mutate(updates);
    setDraggedBrand(null);
  };

  if (authLoading || brandsLoading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <Loader2 className=\"w-8 h-8 animate-spin text-primary\" />
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-background\">
      <header className=\"sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border\">
        <div className=\"container mx-auto px-4 lg:px-8\">
          <div className=\"flex items-center justify-between h-16\">
            <div className=\"flex items-center gap-4\">
              <Button variant=\"ghost\" size=\"icon\" onClick={() => navigate('/admin')}>
                <ArrowLeft className=\"w-5 h-5\" />
              </Button>
              <span className=\"font-display font-bold text-xl\">Brand Management</span>
            </div>
          </div>
        </div>
      </header>

      <main className=\"container mx-auto px-4 lg:px-8 py-8\">
        <div className=\"flex flex-wrap gap-4 mb-8\">
          <Dialog open={isBrandDialogOpen} onOpenChange={(open) => {
            setIsBrandDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className=\"w-4 h-4 mr-2\" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent className=\"max-w-md\">
              <DialogHeader>
                <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className=\"space-y-4\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"name\">Brand Name *</Label>
                  <Input
                    id=\"name\"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder=\"e.g., Samsung, Apple\"
                  />
                </div>

                <div className=\"space-y-2\">
                  <Label htmlFor=\"description\">Description</Label>
                  <Textarea
                    id=\"description\"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder=\"Brand description\"
                  />
                </div>

                <ImageUpload
                  value={formData.logo}
                  onChange={(url) => setFormData({ ...formData, logo: url })}
                  label=\"Brand Logo\"
                />

                <Button type=\"submit\" className=\"w-full\" disabled={createBrand.isPending || updateBrand.isPending}>
                  {createBrand.isPending || updateBrand.isPending ? (
                    <Loader2 className=\"w-4 h-4 animate-spin mr-2\" />
                  ) : null}
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brands ({brands?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"overflow-x-auto\">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className=\"w-12\"></TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands?.map((brand, index) => (
                    <TableRow 
                      key={brand.id}
                      draggable
                      onDragStart={() => handleDragStart(brand.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(brand.id)}
                      className=\"cursor-move\"
                    >
                      <TableCell>
                        <GripVertical className=\"w-4 h-4 text-muted-foreground\" />
                      </TableCell>
                      <TableCell>
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className=\"w-12 h-12 object-contain rounded\"
                          />
                        ) : (
                          <div className=\"w-12 h-12 bg-primary/10 rounded flex items-center justify-center\">
                            <span className=\"text-lg font-bold text-primary\">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className=\"font-medium\">{brand.name}</TableCell>
                      <TableCell className=\"max-w-xs truncate\">{brand.description || '-'}</TableCell>
                      <TableCell>
                        <div className=\"flex gap-1\">
                          <Button 
                            variant=\"ghost\" 
                            size=\"icon\" 
                            className=\"h-6 w-6\"
                            onClick={() => moveBrandUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className=\"w-4 h-4\" />
                          </Button>
                          <Button 
                            variant=\"ghost\" 
                            size=\"icon\" 
                            className=\"h-6 w-6\"
                            onClick={() => moveBrandDown(index)}
                            disabled={index === brands.length - 1}
                          >
                            <ChevronDown className=\"w-4 h-4\" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className=\"flex gap-2\">
                          <Button variant=\"ghost\" size=\"icon\" onClick={() => openEditDialog(brand)}>
                            <Pencil className=\"w-4 h-4\" />
                          </Button>
                          <Button variant=\"ghost\" size=\"icon\" className=\"text-destructive\" onClick={() => handleDelete(brand.id)}>
                            <Trash2 className=\"w-4 h-4\" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!brands || brands.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className=\"text-center py-8 text-muted-foreground\">
                        No brands yet. Add your first brand!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminBrands;