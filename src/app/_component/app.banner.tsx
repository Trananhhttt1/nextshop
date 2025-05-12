"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Flex } from "antd";
import img from "../../../public/img/photo-1555529669-e69e7aa0ba9a.avif";
import Link from "next/link";
export default function Banner() {
  return (
    <div className="w-full bg-cyan-50">
      <div className="w-[768px] mx-auto">
        <div className="lg:grid lg:grid-cols-2 px-4 py-24 ">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className=" "
          >
            <h1 className="mb-4 font-bold text-5xl text-gray-900">
              Discover Modern Essentials for Your Lifestyle
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Shop the latest trends with NextShop's curated collection of
              premium products.
            </p>
            <div className="space-x-3 ">
              <Button type="primary">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button>Learn More</Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mt-2 self-center lg:mt-0"
          >
            <Image
              src={img}
              alt="Banner image"
              className="object-cover w-full   rounded-xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
