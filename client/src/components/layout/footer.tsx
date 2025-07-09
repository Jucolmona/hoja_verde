import { Link } from "wouter";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-accent rounded-full flex items-center justify-center">
                <Leaf className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold">Hoja Verde</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Conectando productos sostenibles con consumidores conscientes para un futuro más verde.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-accent transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-green-accent transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-green-accent transition-colors">
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Productos</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/productos?category=Frutas y Verduras">
                  <a className="hover:text-white transition-colors">Frutas y Verduras</a>
                </Link>
              </li>
              <li>
                <Link href="/productos?category=Café y Bebidas">
                  <a className="hover:text-white transition-colors">Café y Bebidas</a>
                </Link>
              </li>
              <li>
                <Link href="/productos?category=Lácteos y Huevos">
                  <a className="hover:text-white transition-colors">Lácteos y Huevos</a>
                </Link>
              </li>
              <li>
                <Link href="/productos?category=Miel y Endulzantes">
                  <a className="hover:text-white transition-colors">Miel y Endulzantes</a>
                </Link>
              </li>
              <li>
                <Link href="/productos?category=Productos Artesanales">
                  <a className="hover:text-white transition-colors">Productos Artesanales</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Producers */}
          <div>
            <h3 className="font-semibold mb-4">Productores</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/productor/registro">
                  <a className="hover:text-white transition-colors">Cómo Registrarse</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Criterios de Certificación
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Soporte Técnico
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Historias de Éxito
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Centro de Ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Misión y Visión
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Hoja Verde. Todos los derechos reservados. Hecho con 💚 para un futuro sostenible.</p>
        </div>
      </div>
    </footer>
  );
}
