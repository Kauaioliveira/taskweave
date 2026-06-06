"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithGithub(formData: FormData) {
  const raw = formData.get("callbackUrl");
  const redirectTo =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "/workspaces";
  await signIn("github", { redirectTo });
}

export async function signInE2E(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const raw = formData.get("callbackUrl");
  const redirectTo =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "/workspaces";
  await signIn("credentials", {
    email,
    password,
    redirectTo,
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
