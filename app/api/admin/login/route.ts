import { cookies } from "next/headers";
import { COOKIE, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
    return Response.json({ error: "Galat username ya password" }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}