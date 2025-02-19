import { NextResponse } from "next/server";
import axios from "axios";

export async function middleware(request) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  console.log("Middleware triggered");

  const sessionCookie = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const authUser = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${sessionCookie.value}` },
    });

    console.log(authUser);

    if (authUser) {
      const response = NextResponse.next();

      const encodedMessage = Buffer.from(
        JSON.stringify(authUser.data)
      ).toString("base64");

      response.headers.set("x-auth-user", encodedMessage);
      return response;
    } else {
      // return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.log(error);
    // return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
