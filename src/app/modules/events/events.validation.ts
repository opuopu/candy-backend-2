import { z } from 'zod';
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const insertEventSchema = z.object({
  body: z.object({
    title: z.string().optional().default(''),
    description: z.string().optional().default(''),
    address: z.string().min(1, 'Address is required'),
    location: z.object({
      type: z.literal('Point').default('Point'),
      coordinates: z
        .array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]')
        .default([0, 0]),
    }),
    status: z.enum(['active', 'closed']).default('active'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().regex(timeRegex, 'Time must be in hh:mm format (24-hour)'),
    isDeleted: z.boolean().default(false),
  }),
});

const updateEventSchema = z.object({
  user: z.string().min(1, 'User ID is required').optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  location: z
    .object({
      type: z.literal('Point').default('Point').optional(),
      coordinates: z
        .array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]')
        .optional(),
    })
    .optional(),
  status: z.enum(['active', 'closed']).optional(),
  date: z.string().optional(),
  isDeleted: z.boolean().optional(),
  time: z
    .string()
    .regex(timeRegex, 'Time must be in hh:mm format (24-hour)')
    .optional(),
});

const eventValidationSchema = {
  insertEventSchema,
  updateEventSchema,
};

export default eventValidationSchema;
