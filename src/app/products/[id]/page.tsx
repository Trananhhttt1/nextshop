"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import {
  Minus,
  Plus,
  Truck,
  RefreshCw,
  ShieldCheck,
  Heart,
  ShoppingCart,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import ProductGallery from "../../_component/app.ProductGallery";
import StarRating from "../../_component/startRating";
import ProductCard from "../../_component/app.productsCard";
import { useCart } from "../../../context/CartContext";

import {
  useProductById,
  useAllProducts,
} from "../../../hook/useProductQueries";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const route = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeColor, setActiveColor] = useState("blue");
  const [isFavorited, setIsFavorited] = useState(false);
  const { addToCart } = useCart();

  const { data: product, isLoading } = useProductById(id);
  const { data: allProducts } = useAllProducts();

  console.log("data", product);

  // Get related products
  const relatedProducts = allProducts
    ?.filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        },
        quantity
      );
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    route.push("/checkout");
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-500 mb-2">
            Product Not Found
          </h2>
          <p className="mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => route.push("/products")}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  // Create thumbnail images (using variations of the main image for demo)
  const thumbnails = [
    product.imageUrl,
    "https://images.unsplash.com/photo-1599669454699-e2ed799f9c95?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1577801622187-9a1dc69593b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row -mx-4">
          {/* Product Images */}
          <div className="lg:w-1/2 px-4">
            <ProductGallery
              mainImage={product.imageUrl}
              thumbnails={thumbnails}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 px-4">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  <StarRating rating={parseFloat(product.rating)} size="md" />
                </div>
                <span className="text-gray-600 text-sm">
                  {product.reviewCount} Reviews
                </span>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold">${product.price}</span>
                <span className="text-gray-500">/ unit</span>
                {product.onSale && product.originalPrice && (
                  <span className="text-gray-500 text-sm line-through ml-2">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="text-gray-600 mb-6">
                <p>{product.description}</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>Premium quality materials</li>
                  <li>Durable construction</li>
                  <li>Modern design</li>
                  <li>Versatile functionality</li>
                  <li>100% satisfaction guarantee</li>
                </ul>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Colors</h3>
              <div className="flex space-x-3">
                <button
                  className={`w-8 h-8 rounded-full bg-black ${
                    activeColor === "black"
                      ? "border-2 border-blue-600"
                      : "border-2 border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onClick={() => setActiveColor("black")}
                ></button>
                <button
                  className={`w-8 h-8 rounded-full bg-white ${
                    activeColor === "white"
                      ? "border-2 border-blue-600"
                      : "border-2 border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onClick={() => setActiveColor("white")}
                ></button>
                <button
                  className={`w-8 h-8 rounded-full bg-gray-500 ${
                    activeColor === "gray"
                      ? "border-2 border-blue-600"
                      : "border-2 border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onClick={() => setActiveColor("gray")}
                ></button>
                <button
                  className={`w-8 h-8 rounded-full bg-red-500 ${
                    activeColor === "red"
                      ? "border-2 border-blue-600"
                      : "border-2 border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onClick={() => setActiveColor("red")}
                ></button>
                <button
                  className={`w-8 h-8 rounded-full bg-blue-500 ${
                    activeColor === "blue"
                      ? "border-2 border-blue-600"
                      : "border-2 border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onClick={() => setActiveColor("blue")}
                ></button>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-l-lg"
                  onClick={decreaseQuantity}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-16 h-10 rounded-none text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-r-lg"
                  onClick={increaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart and Buy Now buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Buy Now
              </Button>
              <Button
                onClick={toggleFavorite}
                variant="outline"
                size="icon"
                className={`rounded-full ${
                  isFavorited ? "text-pink-500 border-pink-500" : ""
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorited ? "fill-pink-500" : ""}`}
                />
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <Truck className="text-gray-600 mr-3 h-5 w-5" />
                <div>
                  <h3 className="font-medium">Free Shipping</h3>
                  <p className="text-gray-600 text-sm">
                    Free standard shipping on orders over $50
                  </p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <RefreshCw className="text-gray-600 mr-3 h-5 w-5" />
                <div>
                  <h3 className="font-medium">Easy Returns</h3>
                  <p className="text-gray-600 text-sm">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="text-gray-600 mr-3 h-5 w-5" />
                <div>
                  <h3 className="font-medium">Secure Checkout</h3>
                  <p className="text-gray-600 text-sm">SSL encrypted payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="border-b border-gray-200 w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({product.reviewCount})
              </TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6">
              <p className="text-gray-600 mb-4">
                Experience premium quality with our {product.name}. Designed for
                comfort and durability, this product delivers exceptional
                performance for all your needs.
              </p>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <p className="text-gray-600">
                The ergonomic design provides comfort for extended use, while
                the premium materials ensure durability and style. Connect
                easily to your devices for a stable, high-quality experience.
              </p>
            </TabsContent>
            <TabsContent value="specifications" className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b border-gray-200 py-3">
                  <span className="font-medium">Material:</span> Premium quality
                </div>
                <div className="border-b border-gray-200 py-3">
                  <span className="font-medium">Dimensions:</span> 12 x 8 x 2
                  inches
                </div>
                <div className="border-b border-gray-200 py-3">
                  <span className="font-medium">Weight:</span> 1.2 lbs
                </div>
                <div className="border-b border-gray-200 py-3">
                  <span className="font-medium">Warranty:</span> 1 year
                </div>
                <div className="border-b border-gray-200 py-3">
                  <span className="font-medium">Country of Origin:</span> USA
                </div>
                <div className="border-b border-gray-200 py-3">
                  <span className="font-medium">Model Number:</span>{" "}
                  {product.id}XYZ
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="User"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-2">John D.</span>
                      <StarRating rating={5} />
                    </div>
                    <p className="text-gray-500 text-sm mb-2">
                      Verified Purchase • 2 weeks ago
                    </p>
                    <p className="text-gray-700">
                      This product exceeded my expectations! Great quality and
                      fast shipping. I would definitely recommend it to anyone
                      looking for a reliable product.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src="https://randomuser.me/api/portraits/women/44.jpg"
                        alt="User"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-2">Sarah M.</span>
                      <StarRating rating={4} />
                    </div>
                    <p className="text-gray-500 text-sm mb-2">
                      Verified Purchase • 1 month ago
                    </p>
                    <p className="text-gray-700">
                      Very good product for the price. It's comfortable and
                      durable. The only reason I'm not giving 5 stars is because
                      the color was slightly different than what was shown in
                      the pictures.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="faqs" className="py-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-lg mb-2">
                    Is this product covered by warranty?
                  </h4>
                  <p className="text-gray-600">
                    Yes, all our products come with a standard 1-year
                    manufacturer warranty against defects.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2">
                    How do I care for this product?
                  </h4>
                  <p className="text-gray-600">
                    For best results, follow the care instructions included with
                    the product. Generally, we recommend gentle cleaning with
                    appropriate materials for the specific product type.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2">
                    Can I return this if I'm not satisfied?
                  </h4>
                  <p className="text-gray-600">
                    Absolutely! We offer a 30-day return policy on all our
                    products. If you're not completely satisfied, you can return
                    it for a full refund or exchange.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts?.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                name={relatedProduct.name}
                description={relatedProduct.description}
                price={relatedProduct.price}
                imageUrl={relatedProduct.imageUrl}
                rating={relatedProduct.rating}
                reviewCount={relatedProduct.reviewCount}
                isNew={relatedProduct.isNew}
                onSale={relatedProduct.onSale}
                originalPrice={relatedProduct.originalPrice}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
