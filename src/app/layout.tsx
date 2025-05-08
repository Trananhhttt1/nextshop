"use client";
import "./globals.css";
import "antd/dist/reset.css";
import AppHeader from "@/app/component/app.header";
import AppFooter from "../../src/app/component/app.footer";
import { CartProvider } from "./context/CartContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <AppHeader />
          {children}
          <AppFooter />
        </CartProvider>
      </body>
    </html>
  );
}
