import { LoginForm } from "@/components/login-form";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-6">
      {/* Back to home link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>返回首页</span>
      </Link>

      {/* Main login content */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              天机AI
            </h1>
          </div>
          <p className="text-muted-foreground">传统智慧，现代科技</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
