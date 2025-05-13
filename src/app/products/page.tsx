// app/products/page.tsx
import ProductsClient from "./productClient";
import { Product } from "../api/products/types";

export default async function ProductsPage() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const products: Product[] = await res.json();

  return <ProductsClient products={products} />;
}
