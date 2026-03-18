import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useUpdateBrandOrder, DbBrand } from '@/hooks/useBrands';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, GripVertical, ChevronUp, ChevronDown, Package, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';

const AdminBrands = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: products } = useProducts();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();
  const updateBrandOrder = useUpdateBrandOrder();

  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<DbBrand | null>(null);
  const [draggedBrand, setDraggedBrand] = useState<string | null>(null);
  const [selectedBrandForProducts, setSelectedBrandForProducts] = useState<DbBrand | null>(null);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);

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

  const handleViewProducts = (brand: DbBrand) => {
    setSelectedBrandForProducts(brand);
    setIsProductsDialogOpen(true);
  };

  const getBrandProducts = (brandId: string) => {
    if (!products) return [];
    return products.filter(p => p.brand_id === brandId || p.brand?.toLowerCase() === brands?.find(b => b.id === brandId)?.name.toLowerCase());
  };

  if (authLoading || brandsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span className="font-display font-bold text-xl">Brand Management</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Tabs defaultValue="brands" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="brands">Brands Management</TabsTrigger>
            <TabsTrigger value="products">Products by Brand</TabsTrigger>
          </TabsList>

          <TabsContent value="brands">
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={isBrandDialogOpen} onOpenChange={(open) => {
            setIsBrandDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Brand Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Samsung, Apple"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brand description"
                  />
                </div>

                <ImageUpload
                  value={formData.logo}
                  onChange={(url) => setFormData({ ...formData, logo: url })}
                  label="Brand Logo"
                />

                <Button type="submit" className="w-full" disabled={createBrand.isPending || updateBrand.isPending}>
                  {createBrand.isPending || updateBrand.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Products</TableHead>
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
                      className="cursor-move"
                    >
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{getBrandProducts(brand.id).length}</span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{brand.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => moveBrandUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => moveBrandDown(index)}
                            disabled={index === brands.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewProducts(brand)} title="View Products">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(brand)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(brand.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!brands || brands.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No brands yet. Add your first brand!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid gap-6">
              {brands?.map((brand) => {
                const brandProducts = getBrandProducts(brand.id);
                return (
                  <Card key={brand.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                              <span className="text-lg font-bold text-primary">{brand.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <CardTitle>{brand.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{brandProducts.length} products</p>
                          </div>
                        </div>
                        <Button onClick={() => navigate('/admin')} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {brandProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {brandProducts.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell>
                                    <img
                                      src={product.image || '/placeholder.svg'}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate('/admin')}
                                    >
                                      <Pencil className="w-4 h-4 mr-1" />
                                      Edit
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No products in this brand yet.</p>
                          <Button onClick={() => navigate('/admin')} variant="link" size="sm" className="mt-2">
                            Add your first product
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Products Dialog */}
        <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedBrandForProducts && (
                  <div className="flex items-center gap-3">
                    {selectedBrandForProducts.logo ? (
                      <img src={selectedBrandForProducts.logo} alt={selectedBrandForProducts.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{selectedBrandForProducts.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <span>{selectedBrandForProducts.name} Products</span>
                      <p className="text-sm font-normal text-muted-foreground">
                        {selectedBrandForProducts && getBrandProducts(selectedBrandForProducts.id).length} products
                      </p>
                    </div>
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedBrandForProducts && (
              <div className="mt-4">
                {getBrandProducts(selectedBrandForProducts.id).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getBrandProducts(selectedBrandForProducts.id).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img
                              src={product.image || '/placeholder.svg'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsProductsDialogOpen(false);
                                navigate('/admin');
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No products in this brand yet</p>
                    <p className="text-sm mb-4">Add products with brand name "{selectedBrandForProducts.name}" to see them here</p>
                    <Button onClick={() => {
                      setIsProductsDialogOpen(false);
                      navigate('/admin');
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminBrands;
