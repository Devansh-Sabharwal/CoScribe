"use client"

import { useMutation } from "@tanstack/react-query";
import Input, { PasswordInput } from "@repo/ui/input"
import { useState } from "react"
import { signupUser } from "@/api/auth";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { HashLoader } from "react-spinners";
import toast from "react-hot-toast";
import {CreateUserSchema} from "@repo/common/types"

export function AuthPage(){
    const router = useRouter();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [name,setName] = useState("");
    const [errors,setErrors] = useState<{[key:string]:string}>({})
    const mutate = useMutation({
        mutationFn: signupUser,
        onSuccess: ()=>{
            toast.success('User Signed up Successfully')
            router.push('/signin')
        },
        onError: (err)=>{
            setEmail("");
            setPassword("");
            setName("");
            toast.error(err.message);
        }
    })
    const handleSignup = (e: React.FormEvent)=>{
        e.preventDefault();
        const result = CreateUserSchema.safeParse({ email, password, name });
        const newErrors:{[key:string]:string} = {}
        if(!result.success){
          result.error.issues.forEach(element => {
            if(!newErrors[element.path[0]])newErrors[element.path[0]] = element.message
          });
          console.log(result.error);
          setErrors(newErrors);
          return;
        }
        setErrors({})
        mutate.mutate({email,password,name});
    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sign up to start using CoScribe
                </p>
              </div>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </Link>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                title="Name"
                placeholder="Enter your name"
                required={true}
                onChange={(e) => setName(e.target.value)}
                type="text"
                value={name}
                error={errors.name}
              />
              <Input
                title="Email address"
                placeholder="Enter your email"
                required={true}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                value={email}
                error={errors.email}
              />
              <PasswordInput
                title="Password"
                placeholder="Create a password"
                required={true}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                error={errors.password}

                />
              <div className="pt-2">
              <Button
                    text={
                        mutate.isPending ? (
                        <div className="flex justify-center">
                            <HashLoader color="#ffffff" size={20} /> {/* Spinner */}
                        </div>
                        ) : (
                        "Signup"
                        )
                    }
                    onClick={handleSignup}
                    type="submit"
                    disabled={mutate.isPending}
                />
              </div>
            </form>
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-500 text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    };