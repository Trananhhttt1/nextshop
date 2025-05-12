import { NextResponse } from "next/server";
import { mockProducts } from "../data";
export async function GET(req: Request, context: { params: { id: string } }) {
  const id = context.params.id;
  const product = mockProducts.find((p) => p.id === parseInt(id));

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
