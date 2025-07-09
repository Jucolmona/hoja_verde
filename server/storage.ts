import { users, producers, products, orders, orderItems, type User, type InsertUser, type Producer, type InsertProducer, type Product, type InsertProduct, type Order, type InsertOrder, type OrderItem, type InsertOrderItem } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Producers
  getProducer(id: number): Promise<Producer | undefined>;
  getProducerByUserId(userId: number): Promise<Producer | undefined>;
  createProducer(producer: InsertProducer): Promise<Producer>;
  updateProducerCertification(id: number, status: string): Promise<Producer | undefined>;
  getProducers(limit?: number): Promise<Producer[]>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductByQR(qrCode: string): Promise<Product | undefined>;
  getProducts(filters?: { category?: string; search?: string; certified?: boolean }): Promise<Product[]>;
  getProductsByProducer(producerId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  updateProductQR(id: number, qrCode: string): Promise<Product | undefined>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Order Items
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Producers
  async getProducer(id: number): Promise<Producer | undefined> {
    const [producer] = await db.select().from(producers).where(eq(producers.id, id));
    return producer || undefined;
  }

  async getProducerByUserId(userId: number): Promise<Producer | undefined> {
    const [producer] = await db.select().from(producers).where(eq(producers.userId, userId));
    return producer || undefined;
  }

  async createProducer(insertProducer: InsertProducer): Promise<Producer> {
    const [producer] = await db.insert(producers).values(insertProducer).returning();
    return producer;
  }

  async updateProducerCertification(id: number, status: string): Promise<Producer | undefined> {
    const [producer] = await db
      .update(producers)
      .set({ certificationStatus: status })
      .where(eq(producers.id, id))
      .returning();
    return producer || undefined;
  }

  async getProducers(limit = 50): Promise<Producer[]> {
    return await db.select().from(producers).limit(limit).orderBy(desc(producers.createdAt));
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByQR(qrCode: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.qrCode, qrCode));
    return product || undefined;
  }

  async getProducts(filters?: { category?: string; search?: string; certified?: boolean }): Promise<Product[]> {
    let query = db.select().from(products);

    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }

    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`));
    }

    if (filters?.certified) {
      conditions.push(eq(products.certificationStatus, "approved"));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProductsByProducer(producerId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.producerId, producerId));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async updateProductQR(id: number, qrCode: string): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ qrCode })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  // Orders
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  // Order Items
  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(insertItem).returning();
    return item;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
}

export const storage = new DatabaseStorage();
