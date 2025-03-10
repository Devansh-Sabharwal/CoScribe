import { z } from "zod";

const emailSchema = z.string().email({ message: "Invalid email format" });
const passwordSchema = z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(30, { message: "Password cannot exceed 30 characters" })
    .refine(
        (value) => /[0-9]/.test(value), // At least one digit
        { message: "Password must contain at least one digit" }
    )
    .refine(
        (value) => /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value), // At least one special character
        { message: "Password must contain at least one special character" }
    );
const nameSchema = z.string().min(2, { message: "Name must be at least 2 characters" }).max(30, { message: "Name cannot exceed 30 characters" });
const photoSchema = z.string().url({ message: "Photo must be a valid URL" }).optional();

export const CreateUserSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema.optional(),
    photo: photoSchema
});

export const SigninSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const CreateRoomSchema = z.object({
    name: z.string().min(1,{message:"name must be atleast 1 character long"}),
});

export const JWT_CODE = "random#";
