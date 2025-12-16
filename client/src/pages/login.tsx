import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  qualification: z.string().min(2, "Qualification is required"),
  email: z
    .string()
    .email("Invalid email address")
    .regex(/@gmail\.com$/i, "Only Gmail addresses are allowed"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Enter valid 10 digit mobile number"),
  collegeName: z.string().optional(),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Enter valid 6 digit pincode"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      qualification: "",
      email: "",
      phone: "",
      collegeName: "",
      state: "",
      city: "",
      pincode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const participant = await api.createParticipant(values);
      localStorage.setItem("quiz_participant_id", participant._id);
      localStorage.setItem("quiz_participant_name", participant.name);

      toast({
        title: "Welcome",
        description: "You have successfully registered.",
      });

      setLocation("/quiz");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to register. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden py-8">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 px-4"
      >
        <div className="flex flex-col items-center mb-4">
          <img 
            src="/mega-cv-logo.jpg" 
            alt="MEGA-CV" 
            className="h-14 mb-2" 
          />
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase text-center">
            Surgical Infection Decision Quiz
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-xl">Participant Login</CardTitle>
            <CardDescription>
              Enter your details to start the quiz.
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-name"
                          placeholder="Dr. John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-qualification"
                          placeholder="MBBS, MS, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Gmail only)</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-email"
                          placeholder="john@gmail.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-phone"
                          placeholder="9876543210"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collegeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-college"
                          placeholder="Medical College Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-state"
                          placeholder="Maharashtra"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-city"
                          placeholder="Mumbai"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-pincode"
                          placeholder="400001"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  data-testid="button-submit"
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : "Start Quiz"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
