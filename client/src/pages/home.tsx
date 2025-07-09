import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Leaf, QrCode, Tag, Handshake, Search, ShoppingCart, Camera, Coffee, Sprout, Heart } from "lucide-react";
import ProductCard from "@/components/product-card";
import QRScanner from "@/components/qr-scanner";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    select: (data) => data.slice(0, 4), // Show only first 4 products
  });

  const { data: producers = [] } = useQuery({
    queryKey: ["/api/producers"],
    select: (data) => data.slice(0, 3), // Show only first 3 producers
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/productos?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-light to-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-green-primary mb-6">
              Consume <span className="text-green-accent">Sostenible</span>,<br />
              Apoya <span className="text-green-accent">Local</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conectamos productos realmente sostenibles con consumidores conscientes.
              Descubre la historia detrás de cada producto con nuestro sello Hoja Verde.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar productos sostenibles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-accent focus:border-transparent"
                />
                <Button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-accent text-white p-2 rounded-full hover:bg-green-secondary transition-colors"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/productos">
                <Button className="bg-green-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-secondary transition-colors">
                  Explorar Productos
                </Button>
              </Link>
              <Link href="/productor/registro">
                <Button variant="outline" className="border-2 border-green-primary text-green-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-primary hover:text-white transition-colors">
                  Soy Productor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-primary mb-4">
              ¿Cómo Funciona Hoja Verde?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un sistema simple y transparente que conecta productores sostenibles con consumidores conscientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="text-white text-2xl" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-green-primary mb-3">Escanea y Descubre</h3>
              <p className="text-gray-600">
                Cada producto certificado tiene un código QR único que te conecta con la historia del productor,
                prácticas sostenibles y origen del producto.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="text-white text-2xl" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-green-primary mb-3">Sello de Confianza</h3>
              <p className="text-gray-600">
                Nuestro equipo validador evalúa criterios de sostenibilidad: prácticas agrícolas, origen,
                procesos e impacto social antes de otorgar el sello.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="text-white text-2xl" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-green-primary mb-3">Compra Directa</h3>
              <p className="text-gray-600">
                Conecta directamente con el productor, sin intermediarios. Obtén productos frescos
                y apoya la economía local con precios justos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-green-primary mb-4">
                Productos Destacados
              </h2>
              <p className="text-xl text-gray-600">
                Descubre productos certificados con el sello Hoja Verde
              </p>
            </div>
            <Link href="/productos">
              <Button variant="link" className="hidden md:block text-green-primary font-semibold hover:text-green-secondary transition-colors">
                Ver Todos →
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link href="/productos">
              <Button variant="link" className="text-green-primary font-semibold hover:text-green-secondary transition-colors">
                Ver Todos los Productos →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Producer Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-primary mb-4">
              Historias de Nuestros Productores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce las personas y familias detrás de los productos sostenibles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {producers.length > 0 ? producers.map((producer) => (
              <Card key={producer.id} className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-accent flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {producer.farmName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{producer.farmName}</h3>
                      <p className="text-sm text-gray-600">{producer.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {producer.description || producer.story || "Productor comprometido con la sostenibilidad y la calidad."}
                  </p>
                  <div className="flex items-center text-green-accent text-sm">
                    <Leaf className="mr-2" size={16} />
                    <span>Productos Sostenibles</span>
                  </div>
                </CardContent>
              </Card>
            )) : (
              // Default producer stories if no data
              <>
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-accent flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">CM</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Carlos Mendoza</h3>
                        <p className="text-sm text-gray-600">Huila, Colombia</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      "Llevo 20 años cultivando café de manera orgánica. Con Hoja Verde, puedo compartir mi historia
                      directamente con los consumidores y recibir un precio justo por mi trabajo."
                    </p>
                    <div className="flex items-center text-green-accent text-sm">
                      <Coffee className="mr-2" size={16} />
                      <span>Café Premium Orgánico</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-accent flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">MG</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">María González</h3>
                        <p className="text-sm text-gray-600">Valle del Cauca, Colombia</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      "Mi familia ha cultivado tomates por generaciones. Ahora con prácticas sostenibles y el sello
                      Hoja Verde, llegamos a más consumidores que valoran la calidad."
                    </p>
                    <div className="flex items-center text-green-accent text-sm">
                      <Sprout className="mr-2" size={16} />
                      <span>Tomates Orgánicos</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-accent flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">LH</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Luis Herrera</h3>
                        <p className="text-sm text-gray-600">Cundinamarca, Colombia</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      "La apicultura sostenible es mi pasión. Cuido mis abejas sin químicos y produzco la miel más pura.
                      Hoja Verde me ayuda a conectar con clientes que aprecian este cuidado."
                    </p>
                    <div className="flex items-center text-green-accent text-sm">
                      <Heart className="mr-2" size={16} />
                      <span>Miel de Abejas Pura</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* QR Code Demo */}
      <section className="py-16 bg-green-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-green-primary mb-4">
              Prueba el Código QR
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escanea para descubrir la historia completa detrás de un producto certificado
            </p>
          </div>

          <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <QrCode className="mx-auto text-4xl text-gray-400 mb-2" size={64} />
                      <p className="text-sm text-gray-500">Código QR Demo</p>
                      <p className="text-xs text-gray-400">Tomates Orgánicos</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowQRScanner(true)}
                    className="bg-green-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-secondary transition-colors"
                  >
                    <Camera className="mr-2" size={16} />
                    Escanear con Cámara
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 bg-gray-50 p-8">
                <h3 className="text-xl font-bold text-green-primary mb-4">
                  <Leaf className="inline mr-2" size={20} />
                  Información del Producto
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Tomates Orgánicos</h4>
                    <p className="text-sm text-gray-600">Finca Los Arrayanes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Certificación</h4>
                    <p className="text-sm text-gray-600">✅ Sin pesticidas químicos</p>
                    <p className="text-sm text-gray-600">✅ Riego por goteo eficiente</p>
                    <p className="text-sm text-gray-600">✅ Compost orgánico</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Historia del Productor</h4>
                    <p className="text-sm text-gray-600">
                      María cultiva tomates desde hace 15 años usando métodos tradicionales
                      y sostenibles transmitidos por su familia...
                    </p>
                  </div>
                  <Button className="w-full bg-green-primary text-white py-2 rounded-lg hover:bg-green-secondary transition-colors">
                    Ver Historia Completa
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Únete a la Revolución Sostenible
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Ya seas productor rural o consumidor consciente, Hoja Verde te conecta con una comunidad
              comprometida con la sostenibilidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white bg-opacity-10 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sprout className="text-white text-2xl" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Para Productores</h3>
                <p className="text-green-100 mb-6">
                  Certifica tus productos, cuenta tu historia y vende directamente sin intermediarios.
                  Recibe el reconocimiento y precio justo que mereces.
                </p>
                <ul className="text-left text-green-100 mb-6 space-y-2">
                  <li>✓ Registro gratuito</li>
                  <li>✓ Evaluación de sostenibilidad</li>
                  <li>✓ Plataforma de ventas</li>
                  <li>✓ Soporte técnico</li>
                </ul>
                <Link href="/productor/registro">
                  <Button className="w-full bg-green-accent text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-green-primary transition-colors">
                    Registrarme como Productor
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white bg-opacity-10 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="text-white text-2xl" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Para Consumidores</h3>
                <p className="text-green-100 mb-6">
                  Descubre productos realmente sostenibles, conoce la historia de cada productor y
                  contribuye a una economía más justa y verde.
                </p>
                <ul className="text-left text-green-100 mb-6 space-y-2">
                  <li>✓ Productos certificados</li>
                  <li>✓ Historias auténticas</li>
                  <li>✓ Compra directa</li>
                  <li>✓ Impacto positivo</li>
                </ul>
                <Link href="/productos">
                  <Button className="w-full bg-green-accent text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-green-primary transition-colors">
                    Comenzar a Comprar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
    </div>
  );
}
