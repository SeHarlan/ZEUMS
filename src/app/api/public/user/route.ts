import { NextRequest, NextResponse } from "next/server";
import { getUsersWithTimelinesHandler } from "@/server/handlers/user/getPublicUsers";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return getUsersWithTimelinesHandler(req);
}
