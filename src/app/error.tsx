"use client";

import { useEffect } from "react";
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.log("Lỗi nè:", error);
  }, [error]);
  return (
    <>
      <div className="p-4 bg-red-100 text-red-800">
        <h2>❌ Có lỗi rồi!</h2>
        <p>{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Thử lại
        </button>
      </div>
    </>
  );
}
