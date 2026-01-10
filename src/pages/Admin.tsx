import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, useCreateCategory, useToggleFeatured, DbProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap, Plus, Pencil, Trash2, ArrowLeft, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import SpecificationsInput from '@/components/SpecificationsInput';
import { ImageUpload } from '@/components/ImageUpload';

interface SpecificationValue {
  value: string;
  color?: string;
  image?: string;
}

interface SpecificationRow {
  key: string;
  values: SpecificationValue[];
}

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const toggleFeatured = useToggleFeatured();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    name: '',
    description: '',
    price: '',
    image: '',
    category_id: '',
    badge: '',
    in_stock: true,
  });
  const [specifications, setSpecifications] = useState<SpecificationRow[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      name: '',
      description: '',
      price: '',
      image: '',
      category_id: '',
      badge: '',
      in_stock: true,
    });
    setSpecifications([]);
    setEditingProduct(null);
  };

  const openEditDialog = (product: DbProduct) => {
    setEditingProduct(product);
    setFormData({
      brand: product.brand || '',
      model: product.model || '',
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      image: product.image || '',
      category_id: product.category_id || '',
      badge: product.badge || '',
      in_stock: product.in_stock !== false,
    });
    // Convert JSON specs to new array format
    const specs = product.specifications as Record<string, any> | null;
    if (specs && typeof specs === 'object') {
      const convertedSpecs: SpecificationRow[] = [];
      Object.entries(specs).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // New format with multiple values
          convertedSpecs.push({ key, values: value });
        } else {
          // Old format - convert to new format
          convertedSpecs.push({ key, values: [{ value: String(value) }] });
        }
      });
      setSpecifications(convertedSpecs);
    } else {
      setSpecifications([]);
    }
    setIsProductDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand || !formData.model || !formData.price) {
      toast.error('Brand, model, and price are required');
      return;
    }

    // Auto-generate name from brand and model
    const productName = `${formData.brand} ${formData.model}`.trim();

    // Convert specifications array to object
    let specsObject: Record<string, any> | undefined;
    const validSpecs = specifications.filter(row => row.key.trim() && row.values.some(v => v.value.trim()));
    if (validSpecs.length > 0) {
      specsObject = {};
      validSpecs.forEach(row => {
        const cleanValues = row.values.filter(v => v.value.trim());
        if (cleanValues.length === 1 && !cleanValues[0].color && !cleanValues[0].image) {
          // Single value without color/image - store as string for backward compatibility
          specsObject![row.key.trim()] = cleanValues[0].value.trim();
        } else {
          // Multiple values or values with color/image - store as array
          specsObject![row.key.trim()] = cleanValues;
        }
      });
    }

    const productData = {
      brand: formData.brand,
      model: formData.model,
      name: productName,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      image: formData.image || undefined,
      category_id: formData.category_id || undefined,
      badge: formData.badge || undefined,
      in_stock: formData.in_stock,
      specifications: specsObject,
    };

    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
    } else {
      await createProduct.mutateAsync(productData);
    }

    setIsProductDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    await createCategory.mutateAsync(newCategoryName);
    setNewCategoryName('');
    setIsCategoryDialogOpen(false);
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-glow">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
            setIsProductDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., Samsung"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., Galaxy S24"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                      id="badge"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="New, Sale, etc."
                    />
                  </div>
                </div>

                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Product Image"
                />

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>

                <SpecificationsInput
                  specifications={specifications}
                  onChange={setSpecifications}
                />

                <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
                  {createProduct.isPending || updateProduct.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Gaming, Smart Home"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createCategory.isPending}>
                  {createCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Category
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({products?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category?.name || '-'}</TableCell>
                      <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={product.in_stock !== false ? 'text-green-500' : 'text-destructive'}>
                          {product.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured.mutate({ id: product.id, featured: !product.featured })}
                          className={product.featured ? 'text-yellow-500' : 'text-muted-foreground'}
                        >
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!products || products.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No products yet. Add your first product!
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

export default Admin;
