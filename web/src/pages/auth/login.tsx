import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { LucideBook, LucideMail, LucideLock, LucideLoader2, LucideAlertCircle } from "lucide-react";
import { useLogin } from "../../hooks/useLogin";
import { useOAuth } from "../../hooks/useOAuth";
import { loginSchema, type LoginInput } from "../../validations/auth";
import { ZodError } from "zod";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleLogin, isLoading, error: authError, successMessage } = useLogin();
  const { loginWithGoogle, loginWithGitHub, isLoading: oauthLoading, error: oauthError } = useOAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState<string>("");

  // Extract error from URL query parameter on component mount only
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setUrlError(errorParam);
    }
  }, []); // Empty dependency array - run only once on mount

  // Navigate to dashboard ONLY when login is successful
  useEffect(() => {
    console.log("[Login useEffect] State:", { successMessage, authError, isSubmitting });
    if (successMessage && !authError && !isSubmitting) {
      console.log("[Login useEffect] Navigation condition met, navigating to dashboard");
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [successMessage, authError, isSubmitting, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error for this field when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData: LoginInput = loginSchema.parse(formData);
      
      // Call login
      await handleLogin(validatedData);
      
      // useEffect will handle navigation when successMessage is set
    } catch (err: any) {
      console.log("[Login] Login error caught:", err?.message);
      if (err instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        (err as any).errors.forEach((error: any) => {
          if (error.path[0]) {
            newErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(newErrors);
      }
      // If it's not a ZodError, the error is already set by useLogin hook
    } finally {
      setIsSubmitting(false);
     }
   };

   return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
         {/* Header */}
         <div className="mb-8 flex flex-col items-center justify-center text-center">
           <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
             Selamat Kembali
           </h1>
           <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
             Masuk untuk melanjutkan perjalanan penulisan Anda
           </p>
         </div>

         {/* Card */}
         <Card className="border-zinc-200 shadow-lg dark:border-zinc-800">
            <CardHeader className="space-y-2 pb-4 text-center">
              <CardTitle className="text-2xl">Masuk</CardTitle>
              <CardDescription className="text-center">
                Masukkan email dan kata sandi Anda untuk mengakses akun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
                {successMessage && (
                  <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-950">
                    <LucideBook className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                   <div className="flex-1">
                     <p className="text-sm font-medium text-green-800 dark:text-green-200">
                       {successMessage}
                     </p>
                   </div>
                 </div>
               )}
               {(authError || oauthError || urlError || Object.keys(errors).length > 0) && (
                 <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950">
                   <LucideAlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                   <div className="flex-1">
                     <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {authError || oauthError || urlError || "Silakan periksa kesalahan di bawah"}
                      </p>
                     {Object.entries(errors).map(([field, message]) => (
                       <p key={field} className="text-xs text-red-700 dark:text-red-300 mt-1">
                         {message}
                       </p>
                    ))}
                  </div>
                </div>
              )}
             <form onSubmit={handleSubmit} className="space-y-4">
               {/* Email Field */}
               <div className="space-y-2">
                 <Label htmlFor="email" className="text-sm font-medium">
                   Email
                 </Label>
                 <div className="relative">
                   <LucideMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                   <Input
                     id="email"
                     type="email"
                     placeholder="name@example.com"
                     className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                     value={formData.email}
                     onChange={handleChange}
                     disabled={isSubmitting || isLoading}
                   />
                 </div>
                 {errors.email && (
                   <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                 )}
               </div>

               {/* Password Field */}
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Kata Sandi
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                 <div className="relative">
                   <LucideLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Masukkan kata sandi Anda"
                     className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                     value={formData.password}
                     onChange={handleChange}
                     disabled={isSubmitting || isLoading}
                   />
                 </div>
                 {errors.password && (
                   <p className="text-xs text-red-600 dark:text-red-400">{errors.password}</p>
                 )}
               </div>

               {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="mt-6 w-full" 
                  disabled={isSubmitting || isLoading || oauthLoading}
                  size="lg"
                >
                   {isSubmitting || isLoading ? (
                     <>
                       <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                       Sedang masuk...
                     </>
                   ) : (
                     "Masuk"
                   )}
                </Button>
             </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                   Atau lanjutkan dengan
                 </span>
               </div>
            </div>

            {/* Social Buttons */}
             <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  size="lg"
                  onClick={() => loginWithGoogle("login")}
                  disabled={isSubmitting || isLoading || oauthLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  size="lg"
                  onClick={() => loginWithGitHub("login")}
                  disabled={isSubmitting || isLoading || oauthLoading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
            </div>
          </CardContent>

          {/* Footer */}
           <CardFooter className="flex flex-col items-center justify-center border-t border-zinc-200 dark:border-zinc-800 pt-4">
             <p className="flex items-center justify-center gap-1 text-sm">
               <span className="text-zinc-600 dark:text-zinc-400">
                 Belum memiliki akun?
               </span>
               <Link
                 to="/register"
                 className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
               >
                 Daftar
               </Link>
             </p>
           </CardFooter>
        </Card>

         {/* Terms */}
         <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
           Dengan melanjutkan, Anda setuju dengan{" "}
           <Link to="/terms" className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
             Syarat Layanan
           </Link>{" "}
           dan{" "}
           <Link to="/privacy" className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
             Kebijakan Privasi
           </Link>
           .
         </p>
      </div>
    </div>
  );
}