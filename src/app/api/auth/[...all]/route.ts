import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// handle auth with betterauth
export const { POST, GET } = toNextJsHandler(auth);
