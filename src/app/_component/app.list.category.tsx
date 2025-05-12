"use client";
import Card from "./card";

const categories = [
  {
    id: 1,
    name: "Electronics",
    image: "/img/photo-1526170375885-4d8ecf77b99f.avif",
  },
  { id: 2, name: "FaShion", image: "/img/photo-1551232864-3f0890e580d9.avif" },
  {
    id: 3,
    name: "Home and Decor",
    image: "/img/photo-1555529669-e69e7aa0ba9a.avif",
  },
  {
    id: 4,
    name: "Accessories",
    image: "/img/photo-1560769629-975ec94e6a86.avif",
  },
];

export default function AppListCategory() {
  return (
    <div className="p-12">
      <div className="mb-12 flex justify-center items-center">
        <h1 className="text-4xl font-bold mb-0 text-center ">
          Shop by Category
        </h1>
      </div>
      <div className=" flex flex-wrap gap-10 justify-center">
        {categories.map((category) => {
          return <Card key={category.id} category={category} />;
        })}
      </div>
    </div>
  );
}
