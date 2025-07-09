import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, QrCode, MapPin } from "lucide-react";
import { useState } from "react";
import QRScanner from "./qr-scanner";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    unit: string;
    category: string;
    certificationStatus: string;
    images?: string;
    qrCode?: string;
    producerId: number;
  };
  producer?: {
    farmName: string;
    location: string;
  };
}

export default function ProductCard({ product, producer }: ProductCardProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);

  const images = product.images ? JSON.parse(product.images) : [];
  const productImage = images.length > 0 ? images[0] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // TODO: Implement add to cart functionality
    console.log('Added to cart:', product.name);

    // Visual feedback
    const button = e.target as HTMLButtonElement;
    const originalText = button.textContent;
    button.textContent = 'Agregado!';
    button.classList.add('bg-green-secondary');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('bg-green-secondary');
    }, 1000);
  };

  const handleQRClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQRScanner(true);
  };

  return (
    <>
      <Link href={`/producto/${product.id}`}>
        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
          {/* Product Image */}
          <div className="relative h-48">
            {productImage ? (
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Leaf className="text-gray-400" size={48} />
              </div>
            )}

            {/* Overlay badges */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              {product.certificationStatus === "approved" && (
                <Badge className="bg-green-light text-green-primary text-xs font-semibold">
                  <Leaf className="mr-1" size={10} />
                  Certificado
                </Badge>
              )}

              {product.qrCode && (
                <button
                  onClick={handleQRClick}
                  className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  title="Ver código QR"
                >
                  <QrCode className="text-gray-600" size={12} />
                </button>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
              {product.name}
            </h3>

            {producer && (
              <>
                <p className="text-sm text-gray-600 mb-1">{producer.farmName}</p>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <MapPin className="mr-1" size={10} />
                  {producer.location}
                </div>
              </>
            )}

            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
              {product.category}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-green-primary">
                ${Number(product.price).toLocaleString()}/{product.unit}
              </span>

              <Button
                onClick={handleAddToCart}
                size="sm"
                className="bg-green-accent text-white px-3 py-1 rounded-md text-sm hover:bg-green-secondary transition-colors"
              >
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>

      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
    </>
  );
}
