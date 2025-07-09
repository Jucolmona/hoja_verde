import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Camera, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface QRScannerProps {
  onClose: () => void;
}

export default function QRScanner({ onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Query for product data when QR code is scanned
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: [`/api/products/qr/${scannedCode}`],
    enabled: !!scannedCode,
  });

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simulate QR code detection after 3 seconds for demo
      setTimeout(() => {
        simulateQRDetection();
      }, 3000);

    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateQRDetection = () => {
    // Simulate detecting a QR code for demo purposes
    const demoQRCode = "HV-1-1699123456789";
    setScannedCode(demoQRCode);
    stopCamera();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="mr-2" size={20} />
            Escáner de Código QR
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-4"
          >
            <X size={16} />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {!scannedCode && !isScanning && (
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <Camera className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Escanear Código QR
              </h3>
              <p className="text-gray-600 mb-4">
                Apunta la cámara hacia el código QR del producto para conocer su historia
              </p>
              <Button
                onClick={startCamera}
                className="bg-green-accent text-white hover:bg-green-secondary"
              >
                <Camera className="mr-2" size={16} />
                Activar Cámara
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="text-center">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full max-w-md mx-auto rounded-lg"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-green-accent rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 border-2 border-green-accent border-dashed rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                Centra el código QR en el cuadro para escanearlo
              </p>
              <Button
                variant="outline"
                onClick={stopCamera}
                className="mt-2"
              >
                Cancelar
              </Button>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="mr-2" size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {scannedCode && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-primary">
                  <CheckCircle className="mr-2" size={20} />
                  ¡Código QR Detectado!
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando información del producto...</p>
                  </div>
                ) : productData ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {productData.product.name}
                      </h3>
                      <p className="text-gray-600">{productData.product.description}</p>
                    </div>

                    {productData.producer && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Productor</h4>
                        <p className="text-sm text-gray-600">
                          {productData.producer.farmName} • {productData.producer.location}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Certificación</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">✅ Producto certificado sostenible</p>
                        <p className="text-sm text-gray-600">✅ Prácticas agrícolas responsables</p>
                        <p className="text-sm text-gray-600">✅ Comercio directo del productor</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => window.location.href = `/producto/${productData.product.id}`}
                        className="flex-1 bg-green-primary hover:bg-green-secondary"
                      >
                        Ver Producto Completo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setScannedCode(null);
                          setError(null);
                        }}
                      >
                        Escanear Otro
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32} />
                    <p className="text-gray-600">
                      No se encontró información para este código QR
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScannedCode(null);
                        setError(null);
                      }}
                      className="mt-2"
                    >
                      Intentar de Nuevo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
