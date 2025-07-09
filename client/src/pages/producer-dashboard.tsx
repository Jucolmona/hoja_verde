import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Package, BarChart3, QrCode, Edit, Eye } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "El nombre del producto es requerido"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  price: z.string().min(1, "El precio es requerido"),
  unit: z.string().min(1, "La unidad es requerida"),
  stockQuantity: z.number().min(0, "La cantidad debe ser mayor o igual a 0"),
});

type ProductForm = z.infer<typeof productSchema>;

const categories = [
  "Frutas y Verduras",
  "Café y Bebidas",
  "Lácteos y Huevos",
  "Miel y Endulzantes",
  "Productos Artesanales"
];

const units = ["kg", "g", "unidad", "litro", "ml", "docena", "canasta"];

export default function ProducerDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user (in real app, this would come from auth context)
  const userId = 1; // Mock user ID

  const { data: producer } = useQuery({
    queryKey: [`/api/producers/user/${userId}`],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: [`/api/products/producer/${producer?.id}`],
    enabled: !!producer?.id,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stockQuantity: 0,
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const response = await apiRequest("POST", "/api/products", {
        ...data,
        price: data.price,
        sustainabilityInfo: JSON.stringify({
          organic: true,
          practices: ["Agricultura orgánica", "Sin químicos"]
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Producto agregado",
        description: "Tu producto ha sido creado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/products/producer/${producer?.id}`] });
      setShowAddProduct(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductForm) => {
    addProductMutation.mutate(data);
  };

  if (!producer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6">
              Debes ser un productor registrado para acceder a esta página.
            </p>
            <Button onClick={() => window.location.href = "/productor/registro"}>
              Registrarse como Productor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Productor
          </h1>
          <p className="text-gray-600">
            Gestiona tus productos y monitorea tu desempeño
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <Package className="text-green-primary" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Productos Certificados</p>
                  <p className="text-3xl font-bold text-green-primary">
                    {products.filter(p => p.certificationStatus === "approved").length}
                  </p>
                </div>
                <QrCode className="text-green-primary" size={32} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado de Certificación</p>
                  <Badge
                    variant={producer.certificationStatus === "approved" ? "default" : "secondary"}
                    className={producer.certificationStatus === "approved" ? "bg-green-accent" : ""}
                  >
                    {producer.certificationStatus === "approved" ? "Certificado" : "En proceso"}
                  </Badge>
                </div>
                <BarChart3 className="text-green-primary" size={32} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Producer Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información de tu Finca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">{producer.farmName}</h3>
                <p className="text-gray-600 mb-2">{producer.location}</p>
                {producer.description && (
                  <p className="text-gray-700">{producer.description}</p>
                )}
              </div>
              <div>
                {producer.story && (
                  <div>
                    <h4 className="font-medium mb-2">Tu Historia</h4>
                    <p className="text-gray-700 text-sm">{producer.story}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mis Productos</CardTitle>
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button className="bg-green-primary hover:bg-green-secondary">
                  <Plus className="mr-2" size={16} />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Producto</FormLabel>
                          <FormControl>
                            <Input placeholder="Tomates orgánicos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe tu producto: calidad, características, proceso de cultivo..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <FormControl>
                              <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...field}
                              >
                                <option value="">Seleccionar categoría</option>
                                {categories.map(category => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidad de Medida</FormLabel>
                            <FormControl>
                              <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                {...field}
                              >
                                <option value="">Seleccionar unidad</option>
                                {units.map(unit => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad Disponible</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddProduct(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={addProductMutation.isPending}
                        className="bg-green-primary hover:bg-green-secondary"
                      >
                        {addProductMutation.isPending ? "Agregando..." : "Agregar Producto"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-primary mx-auto"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge
                          variant={product.certificationStatus === "approved" ? "default" : "secondary"}
                          className={product.certificationStatus === "approved" ? "bg-green-accent" : ""}
                        >
                          {product.certificationStatus === "approved" ? "Certificado" : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                      <p className="text-sm text-gray-700">{product.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="font-medium text-green-primary">
                          ${Number(product.price).toLocaleString()} / {product.unit}
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {product.stockQuantity || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1" size={14} />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1" size={14} />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes productos aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Agrega tu primer producto para comenzar a vender
                </p>
                <Button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-green-primary hover:bg-green-secondary"
                >
                  Agregar Producto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
