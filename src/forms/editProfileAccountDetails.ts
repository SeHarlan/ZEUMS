import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
// Form schema with Zod validation
export const profileAccountFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Username can only contain letters, numbers, underscores, and hyphens.",
    })
    .superRefine((val, ctx) => { 
      if (val.length > 30) {
        let isWalletAddress = false;
        try { 
          //allow default username (wallet address)
          isWalletAddress = PublicKey.isOnCurve(val);
        } catch {
          isWalletAddress = false;
        }

        if (!isWalletAddress) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: 30,
            type: "string",
            inclusive: true,
            message: "Username must not exceed 30 characters.",
          });
        }
      }
    }),
});

export type AccountDetailsFormValues = z.infer<typeof profileAccountFormSchema>;
