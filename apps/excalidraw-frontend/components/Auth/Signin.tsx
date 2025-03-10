"use client"
import { useMutation } from "@tanstack/react-query";
import Input, { PasswordInput } from "@repo/ui/input"
import { useState } from "react"
import { signInUser } from "@/api/auth";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { HashLoader } from "react-spinners";
import toast from "react-hot-toast";
export function AuthPage(){
    const router = useRouter();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const mutate = useMutation({
        mutationFn: signInUser,
        onSuccess: (data)=>{
            toast.success('User Signed in Successfully')
            localStorage.setItem('token',data.token);
            router.push('./dashboard')
        },
        onError: (err)=>{
            setEmail("");
            setPassword("");
            toast.error(err.message);
        }
    })
    const handleSignup = (e: React.FormEvent)=>{
        e.preventDefault();
        mutate.mutate({email,password});
    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
                <p className="text-sm text-gray-600 mt-1">
                Sign in to sketch ideas together on CoScribe.
                </p>
              </div>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </Link>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">              
                <Input
                title="Email address"
                placeholder="Enter your email"
                required={true}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                value={email}
              />
              <PasswordInput
                title="Password"
                placeholder="Create a password"
                required={true}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                />
              <div className="pt-2">
              <Button 
                    text={
                        mutate.isPending ? (
                        <div className="flex justify-center">
                            <HashLoader color="#ffffff" size={20} />
                        </div>
                        ) : (
                        "Signin"
                        )
                    } onClick={handleSignup} type="submit" disabled={mutate.isPending} />
                
              </div>
            </form>
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Create an account?{" "}
                <Link href="/signup" className="text-blue-500 text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
}