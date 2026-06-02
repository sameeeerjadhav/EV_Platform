import { z } from "zod";

export const createDealerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    company: z.string().min(2, "Company name is required"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
    address: z.string().optional(),
    isApproved: z.boolean().default(true),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateDealerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(2, "Company name is required"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  address: z.string().optional(),
  isApproved: z.boolean(),
  isActive: z.boolean(),
});

export type CreateDealerFormData = z.infer<typeof createDealerSchema>;
export type UpdateDealerFormData = z.infer<typeof updateDealerSchema>;
