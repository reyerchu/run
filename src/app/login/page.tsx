import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center"><p className="text-gray-400">載入中...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
