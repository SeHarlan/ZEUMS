import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep auth routes accessible
  const isAuthRoute = pathname.startsWith("/api/auth/");

  // Allow public routes to pass through
  const isPublicRoute = pathname.includes("/public");
  
  const isAssetRoute = pathname.includes("/assets");
  const isImageRoute = pathname.includes("/image");

  if (isPublicRoute || isAuthRoute || isAssetRoute || isImageRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.user?.dbUserId) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Authentication for ZEUMS access is required",
      }),
      {
        status: 401,
        headers: { "content-type": "application/json" },
      }
    );
  }

  return NextResponse.next();
}

// Simplify matcher to only apply to API routes
export const config = {
  matcher: ["/api/:path*"],
};
