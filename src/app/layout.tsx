"use client";
import "./globals.css";
import "antd/dist/reset.css";
import AppHeader from "@/app/component/app.header";
import AppFooter from "../../src/app/component/app.footer";
import { CartProvider } from "./context/CartContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <QueryClientProvider client={queryClient}>
            <AppHeader />
            {children}
            <AppFooter />
          </QueryClientProvider>
        </CartProvider>
      </body>
    </html>
  );
}
