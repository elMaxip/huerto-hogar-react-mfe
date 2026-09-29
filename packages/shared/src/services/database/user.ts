import type { NewUser, User } from "../../models/user";
import { openDatabase, request } from "./db";

export async function register(user: NewUser): Promise<User> {
  const db = await openDatabase();
  const store = db.transaction("users", "readwrite").objectStore("users");

  const id = (await request(store.add(user))) as number;

  return { ...user, id };
}

export async function getUser(email: string): Promise<User | undefined> {
  const db = await openDatabase();
  const store = db.transaction("users", "readonly").objectStore("users");

  return request<User | undefined>(store.index("email_idx").get(email));
}
