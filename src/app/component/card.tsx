"use client";
import Image from "next/image";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  image: string;
};
export default function Card({ category }: { category: Category }) {
  return (
    <div className="  w-[216px] h-[216px] border rounded-xl  group shadow-md overflow-hidden">
      <Link href="/products">
        <div className="relative w-full h-full">
          <Image
            src={category.image}
            alt="Banner image"
            fill
            className="object-fill w-full h-auto rounded-xl opacity-75 group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute left-2 bottom-1 text-xl font-bold text-stone-100">
            <p>{category.name}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
