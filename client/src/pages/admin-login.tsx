import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const formSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await api.adminLogin(values.username, values.password);
      localStorage.setItem("admin_session", "true");
      toast({ title: "Admin Access Granted" });
      setLocation("/admin/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message || "Invalid credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden text-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10 px-4"
      >
        <div className="flex justify-center mb-6">
          <img 
            src="/vonasec-logo.jpg" 
            alt="MEGA-CV" 
            className="h-16" 
          />
        </div>

        <Card className="border-slate-800 bg-slate-950 text-slate-50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-white">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Secure access only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-username"
                          placeholder=""
                          {...field}
                          className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Password</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-password"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  data-testid="button-login"
                  type="submit"
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Quiz
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
