"use client";
import Link from "next/link";
import { ShoppingBag, User, ShoppingCart, Menu, Search, X } from "lucide-react";
import { Input } from "antd";
import { useState } from "react";
import { isActive } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathName = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 flex items-center"
          >
            <ShoppingBag className="mr-2" />
            <span>NextShop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`font-medium hover:text-blue-600 transition-colors ${
                isActive(pathName, "/") ? "text-blue-500" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`font-medium hover:text-blue-600 transition-colors ${
                isActive(pathName, "/products") ? "text-blue-500" : ""
              }`}
            >
              Products
            </Link>
            <Link
              href="#"
              className={`font-medium hover:text-blue-600 transition-colors ${
                isActive(pathName, "/#") ? "text-blue-500" : ""
              }`}
            >
              Categories
            </Link>
            <Link
              href="#"
              className={`font-medium hover:text-blue-600 transition-colors ${
                isActive(pathName, "/#") ? "text-blue-500" : ""
              }`}
            >
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <form>
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
            </div>

            <button className="text-gray-600 hover:text-blue-600 transition-colors">
              <User className="h-5 w-5" />
            </button>

            <button className="text-gray-600 hover:text-blue-600 transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {1 > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  1
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
              onClick={handleOpenMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-4 md:hidden">
          <form>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden mt-4 pb-2 ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              className="font-medium hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="font-medium hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
            >
              Products
            </Link>
            <Link
              href="#"
              className="font-medium hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
            >
              Categories
            </Link>
            <Link
              href="#"
              className="font-medium hover:text-blue-600 transition-colors py-2"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
