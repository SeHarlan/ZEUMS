import { getPublicUserByUsernameHandler } from "@/server/handlers/user/getPublicUserByUsername";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const resolvedParams = await params;
  return getPublicUserByUsernameHandler(resolvedParams.username);
}
