"use client";
import "./globals.css";
import "antd/dist/reset.css";
import AppHeader from "@/app/_component/app.header";
import AppFooter from "./_component/app.footer";
import AppShoppingCart from "../app/_component/ShoppingCart";
import { CartProvider } from "../context/CartContext";
import QueryProvider from "../context/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <QueryProvider>
          <CartProvider>
            <AppHeader />
            {children}
            <AppFooter />
            <AppShoppingCart />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
