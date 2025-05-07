import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "Premium wireless headphones with high-quality sound, noise cancellation, and long battery life. Perfect for music lovers and professionals who need clear audio for calls and meetings.",
    price: "129.99",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Electronics",
    featured: true,
    isNew: false,
    onSale: false,
    rating: "4.5",
    reviewCount: 42,
    originalPrice: null
  },
  {
    id: 2,
    name: "Smart Watch",
    description: "Health & fitness tracker with heart rate monitoring, sleep tracking, and smartphone notifications. Water-resistant and long battery life.",
    price: "199.99",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
    category: "Electronics",
    featured: true,
    isNew: false,
    onSale: false,
    rating: "4.0",
    reviewCount: 38,
    originalPrice: null
  },
  {
    id: 3,
    name: "Running Shoes",
    description: "Lightweight & comfortable running shoes with responsive cushioning and breathable mesh upper for maximum comfort and performance.",
    price: "89.99",
    imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
    category: "Fashion",
    featured: true,
    isNew: true,
    onSale: false,
    rating: "5.0",
    reviewCount: 56,
    originalPrice: null
  },
  {
    id: 4,
    name: "Crossbody Bag",
    description: "Stylish & functional crossbody bag with multiple compartments and adjustable strap. Perfect for everyday use.",
    price: "49.99",
    imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a",
    category: "Accessories",
    featured: true,
    isNew: false,
    onSale: true,
    rating: "3.5",
    reviewCount: 24,
    originalPrice: "69.99"
  },
  {
    id: 5,
    name: "Red Sneakers",
    description: "Casual & comfortable sneakers with a stylish red design. Made with high-quality materials for durability.",
    price: "79.99",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Fashion",
    featured: false,
    isNew: false,
    onSale: false,
    rating: "4.0",
    reviewCount: 18,
    originalPrice: null
  },
  {
    id: 6,
    name: "Polaroid Camera",
    description: "Instant photography camera that prints physical photos on the spot. Capture memories in a vintage style.",
    price: "149.99",
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    category: "Electronics",
    featured: false,
    isNew: false,
    onSale: false,
    rating: "4.5",
    reviewCount: 32,
    originalPrice: null
  }
];

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private userIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.userIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;

    // Initialize with mock products
    mockProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.featured
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        product.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async addOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
}

// Export a singleton instance
export const storage = new MemStorage();
