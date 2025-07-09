import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Leaf, QrCode, ShoppingCart, Star, CheckCircle, Users, Truck } from "lucide-react";
import { useState } from "react";
import QRScanner from "@/components/qr-scanner";

export default function ProductDetail() {
  const [match, params] = useRoute("/producto/:id");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${params?.id}`],
    enabled: !!params?.id,
  });

  const { data: producer } = useQuery({
    queryKey: [`/api/producers/${product?.producerId}`],
    enabled: !!product?.producerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = product.images ? JSON.parse(product.images as string) : [];
  const sustainabilityInfo = product.sustainabilityInfo ? JSON.parse(product.sustainabilityInfo as string) : {};
  const isOrganic = sustainabilityInfo?.organic || false;
  const practices = sustainabilityInfo?.practices || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              {images.length > 0 ? (
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Leaf className="text-gray-400" size={64} />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.certificationStatus === "approved" && (
                  <Badge className="bg-green-light text-green-primary">
                    <Leaf className="mr-1" size={12} />
                    Certificado
                  </Badge>
                )}
                {isOrganic && (
                  <Badge variant="secondary">Orgánico</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {producer && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="mr-2" size={16} />
                  <span>{producer.farmName} • {producer.location}</span>
                </div>
              )}

              <p className="text-gray-700 text-lg">{product.description}</p>
            </div>

            {/* Price and Purchase */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-green-primary">
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">por {product.unit}</span>
                  </div>

                  {product.qrCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQRScanner(true)}
                      className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                    >
                      <QrCode className="mr-2" size={16} />
                      Ver QR
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium">Cantidad:</label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8"
                    >
                      -
                    </Button>
                    <span className="mx-3 font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button className="w-full bg-green-primary hover:bg-green-secondary text-white">
                  <ShoppingCart className="mr-2" size={16} />
                  Agregar al Carrito
                </Button>

                <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                  <Truck className="mr-2" size={16} />
                  Entrega directa del productor
                </div>
              </CardContent>
            </Card>

            {/* Sustainability Info */}
            {practices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-primary">
                    <CheckCircle className="mr-2" size={20} />
                    Prácticas Sostenibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {practices.map((practice: string, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="mr-2 text-green-accent" size={16} />
                        {practice}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Producer Information */}
        {producer && (
          <div className="mt-12">
            <Separator className="mb-8" />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2" size={20} />
                  Conoce al Productor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{producer.farmName}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="mr-2" size={16} />
                      {producer.location}
                    </div>
                    {producer.description && (
                      <p className="text-gray-700 mb-4">{producer.description}</p>
                    )}
                    {producer.story && (
                      <div>
                        <h4 className="font-medium mb-2">Historia del Productor</h4>
                        <p className="text-gray-700">{producer.story}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    {producer.sustainabilityPractices && (
                      <div>
                        <h4 className="font-medium mb-2">Prácticas de Sostenibilidad</h4>
                        <div className="space-y-2">
                          {JSON.parse(producer.sustainabilityPractices as string).map((practice: string, index: number) => (
                            <div key={index} className="flex items-center text-sm">
                              <Leaf className="mr-2 text-green-accent" size={14} />
                              {practice}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Badge
                        variant={producer.certificationStatus === "approved" ? "default" : "secondary"}
                        className={producer.certificationStatus === "approved" ? "bg-green-accent" : ""}
                      >
                        {producer.certificationStatus === "approved" ? "Certificado" : "En proceso de certificación"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
    </div>
  );
}
