import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/auth?mode=signin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/trade/:path*", "/dashboard/:path*"],
};
