import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Không tìm thấy trang</h2>
      <p className="text-gray-600 mb-6">
        Xin lỗi, trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        href="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
