import { z } from "zod";

const addressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  streetAddress: z.string().min(1, "Street Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip Code is required"),
});

const candySchema = z.object({
  body: z.object({
    address: z.string({ required_error: "address is required" }),
    location: z.object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
    }),
    date: z
      .string()
      .regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in the format MM-DD-YYYY") // Updated regex for MM-DD-YYYY format
      .refine((val) => {
        const [month, day, year] = val.split("-");
        const parsedDate = new Date(`${year}-${month}-${day}`);
        return (
          !isNaN(parsedDate.getTime()) &&
          val ===
            `${String(month).padStart(2, "0")}-${String(day).padStart(
              2,
              "0"
            )}-${year}`
        );
      }, "Invalid date format or not a valid date"),
  }),
});

export const candyValidaiton = {
  candySchema,
};
