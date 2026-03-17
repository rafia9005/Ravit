import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { LucideLoader2, LucideAlertCircle } from "lucide-react";
import { Cookies } from "react-cookie";
import { useAuth } from "../../hooks/useAuth";

const COOKIE_OPTIONS = { path: "/" };
const cookies = new Cookies();

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchUser, setError: setAuthError } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token from URL query parameter
        const token = searchParams.get("token");
        
        if (!token) {
           setError("Token not found. Please try logging in again.");
           return;
         }

        console.log("[OAuthCallback] Token received from URL");
        
        // Store token in cookies (mimicking the auth system's token storage)
        // OAuth returns a single JWT token that acts as the access token
        cookies.set("accessToken", token, COOKIE_OPTIONS);
        cookies.set("refreshToken", token, COOKIE_OPTIONS); // Use same token as refresh token for OAuth
        cookies.set("tokenType", "Bearer", COOKIE_OPTIONS);
        cookies.set("expiresIn", 3600, COOKIE_OPTIONS); // Default 1 hour
        
        console.log("[OAuthCallback] Token stored in cookies");
        
        // Fetch user data to populate auth context
        await fetchUser();
        
        console.log("[OAuthCallback] User data fetched successfully");
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
       } catch (err) {
         console.error("[OAuthCallback] Error processing callback:", err);
         const errorMsg = err instanceof Error ? err.message : "An error occurred while processing login";
         setError(errorMsg);
         setAuthError(errorMsg);
       }
    };

    handleCallback();
  }, [searchParams, navigate, fetchUser, setAuthError]);

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
           <Card className="border-zinc-200 shadow-lg dark:border-zinc-800">
             <CardHeader className="space-y-2 pb-4 text-center">
               <CardTitle className="text-2xl">Login Failed</CardTitle>
               <CardDescription className="text-center">
                 An error occurred while processing OAuth callback
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-6 pb-6">
               <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950">
                 <LucideAlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                 <div className="flex-1">
                   <p className="text-sm font-medium text-red-800 dark:text-red-200">
                     {error}
                   </p>
                   <a
                     href="/login"
                     className="mt-2 inline-block text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline"
                   >
                     Back to login page
                   </a>
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
       <Card className="border-zinc-200 shadow-lg dark:border-zinc-800">
           <CardHeader className="space-y-2 pb-4 text-center">
             <CardTitle className="text-2xl">Processing Login</CardTitle>
             <CardDescription className="text-center">
               Please wait while we process your information...
             </CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col items-center justify-center py-12">
             <LucideLoader2 className="h-12 w-12 animate-spin text-zinc-600 dark:text-zinc-400" />
             <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
               Redirecting to dashboard...
             </p>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}

