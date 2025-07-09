import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Leaf, QrCode, ShoppingCart, Menu, Search, User } from "lucide-react";
import QRScanner from "@/components/qr-scanner";

export default function Header() {
  const [location] = useLocation();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [cartItemCount] = useState(3); // Mock cart count

  const navigation = [
    { name: "Productos", href: "/productos" },
    { name: "Productores", href: "/productores" },
    { name: "Certificación", href: "/certificacion" },
    { name: "Nosotros", href: "/nosotros" },
  ];

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-green-accent rounded-full flex items-center justify-center">
                  <Leaf className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold text-green-primary">Hoja Verde</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`transition-colors ${
                      location === item.href
                        ? "text-green-primary"
                        : "text-gray-700 hover:text-green-primary"
                    }`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* QR Scanner */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQRScanner(true)}
                className="p-2 text-gray-600 hover:text-green-primary transition-colors"
              >
                <QrCode size={20} />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 hover:text-green-primary transition-colors relative"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-green-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* Auth Button */}
              <Button className="bg-green-primary text-white hover:bg-green-secondary transition-colors">
                <User className="mr-2" size={16} />
                Ingresar
              </Button>

              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden p-2 text-gray-600">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* Mobile Search */}
                    <div className="relative">
                      <Input placeholder="Buscar productos..." className="pl-10" />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex flex-col space-y-4">
                      {navigation.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <a
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                              location === item.href
                                ? "text-green-primary bg-green-light"
                                : "text-gray-700 hover:text-green-primary hover:bg-gray-50"
                            }`}
                          >
                            {item.name}
                          </a>
                        </Link>
                      ))}
                    </div>

                    {/* Mobile Actions */}
                    <div className="border-t pt-4 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowQRScanner(true)}
                      >
                        <QrCode className="mr-2" size={16} />
                        Escanear QR
                      </Button>

                      <Button variant="outline" className="w-full justify-start">
                        <ShoppingCart className="mr-2" size={16} />
                        Carrito ({cartItemCount})
                      </Button>

                      <Link href="/productor/registro">
                        <Button variant="outline" className="w-full justify-start">
                          Soy Productor
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
    </>
  );
}
