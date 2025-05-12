import { NextResponse } from "next/server";

import { mockProducts } from "./data";

//get api
export async function GET(req: Request) {
  return NextResponse.json(mockProducts);
}
