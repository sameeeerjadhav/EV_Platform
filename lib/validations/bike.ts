import { z } from "zod";

export const bikeSchema = z.object({
  name: z.string().min(2, "Bike name must be at least 2 characters"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  batteryCapacity: z.string().min(1, "Battery capacity is required"),
  range: z.string().min(1, "Range is required"),
  topSpeed: z.string().min(1, "Top speed is required"),
  chargingTime: z.string().min(1, "Charging time is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Price must be a positive number"
    ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  isAvailable: z.boolean(),
});

export const bikeFilterSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  isAvailable: z.enum(["true", "false", "all"]).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type BikeFormData = z.infer<typeof bikeSchema>;
export type BikeFilterData = z.infer<typeof bikeFilterSchema>;
