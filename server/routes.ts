import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProducerSchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { generateQRCode } from "./lib/qr-utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hoja-verde-secret-key";

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Error al registrar usuario" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        },
        token
      });
    } catch (error) {
      res.status(400).json({ message: "Error al iniciar sesión" });
    }
  });

  // Producer routes
  app.post("/api/producers", authenticateToken, async (req, res) => {
    try {
      const producerData = insertProducerSchema.parse({
        ...req.body,
        userId: (req as any).user.id,
      });

      const producer = await storage.createProducer(producerData);
      res.json(producer);
    } catch (error) {
      res.status(400).json({ message: "Error al registrar productor" });
    }
  });

  app.get("/api/producers", async (req, res) => {
    try {
      const producers = await storage.getProducers();
      res.json(producers);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productores" });
    }
  });

  app.get("/api/producers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const producer = await storage.getProducer(id);

      if (!producer) {
        return res.status(404).json({ message: "Productor no encontrado" });
      }

      res.json(producer);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productor" });
    }
  });

  app.get("/api/producers/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const producer = await storage.getProducerByUserId(userId);

      if (!producer) {
        return res.status(404).json({ message: "Productor no encontrado" });
      }

      res.json(producer);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productor" });
    }
  });

  // Product routes
  app.post("/api/products", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;

      // Get producer for this user
      const producer = await storage.getProducerByUserId(user.id);
      if (!producer) {
        return res.status(400).json({ message: "Usuario no es un productor registrado" });
      }

      const productData = insertProductSchema.parse({
        ...req.body,
        producerId: producer.id,
      });

      const product = await storage.createProduct(productData);

      // Generate QR code for the product
      const qrCode = await generateQRCode(product.id);
      await storage.updateProductQR(product.id, qrCode);

      res.json({ ...product, qrCode });
    } catch (error) {
      res.status(400).json({ message: "Error al crear producto" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, certified } = req.query;

      const filters = {
        category: category as string,
        search: search as string,
        certified: certified === "true",
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener producto" });
    }
  });

  app.get("/api/products/qr/:qrCode", async (req, res) => {
    try {
      const qrCode = req.params.qrCode;
      const product = await storage.getProductByQR(qrCode);

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Get producer information
      const producer = await storage.getProducer(product.producerId);

      res.json({
        product,
        producer,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener producto por QR" });
    }
  });

  app.get("/api/products/producer/:producerId", async (req, res) => {
    try {
      const producerId = parseInt(req.params.producerId);
      const products = await storage.getProductsByProducer(producerId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos del productor" });
    }
  });

  // Order routes
  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const { items, deliveryAddress, notes } = req.body;

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          totalAmount += parseFloat(product.price) * item.quantity;
        }
      }

      const orderData = insertOrderSchema.parse({
        userId: user.id,
        totalAmount: totalAmount.toString(),
        deliveryAddress,
        notes,
      });

      const order = await storage.createOrder(orderData);

      // Create order items
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          });
        }
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Error al crear pedido" });
    }
  });

  app.get("/api/orders/user/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener pedidos" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      const items = await storage.getOrderItems(id);

      res.json({
        ...order,
        items,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener pedido" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// QR Utils (inline implementation since it's small)
async function generateQRCode(productId: number): Promise<string> {
  // In a real implementation, this would generate a proper QR code
  // For now, we'll return a unique identifier
  return `HV-${productId}-${Date.now()}`;
}
