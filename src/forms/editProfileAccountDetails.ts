import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
// Form schema with Zod validation
export const profileAccountFormSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters.",
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
  // wallets: z.object({
  //   [ChainIdsEnum.SOLANA]: z.array(z.string()).optional(),
  //   [ChainIdsEnum.TEZOS]: z.array(z.string()).optional(),
  //   // [ChainIdsEnum.ETHEREUM]: z.array(z.string()).optional(),
  //   // [ChainIdsEnum.ORDINAL]: z.array(z.string()).optional(),
  // }).optional(),
  email: z.union([
      z.string().email({ message: "Please enter a valid email address." }),
      z.literal("") // Explicitly allow empty string
    ])
    .optional()
});

export type AccountDetailsFormValues = z.infer<typeof profileAccountFormSchema>;
