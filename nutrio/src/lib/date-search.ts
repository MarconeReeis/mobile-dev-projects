import { z } from "zod";

/** Search params das telas por data: `?data=AAAA-MM-DD` (ausente = hoje). */
export const dateSearchSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
});
