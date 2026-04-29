import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub: number;
  role: string;
  exp?: number;
};

const roleHomeMap: Record<string, string> = {
  admin: "/admin",
  student: "/student",
  instructor: "/instructor",
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ["/admin", "/student", "/instructor"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const userRole = decoded.role?.toLowerCase();

    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const correctHome = roleHomeMap[userRole];

    if (!correctHome) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!pathname.startsWith(correctHome)) {
      return NextResponse.redirect(new URL(correctHome, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/instructor/:path*"],
};
