import { z } from "zod"

export const childSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number({ error: "Enter a valid age" }).min(1).max(18),
  gender: z.enum(["male", "female"]),
})

export const parentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .regex(/^\+9656\d{7}$|^\+9655\d{7}$|^\+9651\d{7}$|^\+9659\d{7}$/, "Enter a valid Kuwait mobile number (+965)"),
  email: z.string().email("Enter a valid email address"),
})

export const detailsSchema = z.object({
  child: childSchema,
  parent: parentSchema,
  medicalNotes: z.string().optional().default(""),
})

export type ChildFormValues = z.infer<typeof childSchema>
export type ParentFormValues = z.infer<typeof parentSchema>
export type DetailsFormValues = z.infer<typeof detailsSchema>
