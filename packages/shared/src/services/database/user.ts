import { normalizeRole, type NewUser, type User } from "../../models/user";
import { openDatabase, request } from "./db";

async function userStore(mode: IDBTransactionMode = "readonly") {
  const db = await openDatabase();

  return db.transaction("users", mode).objectStore("users");
}

function withRole(user: User | undefined): User | undefined {
  return user && { ...user, role: normalizeRole(user.role) };
}

export async function register(user: NewUser): Promise<User> {
  const store = await userStore("readwrite");

  const id = (await request(store.add(user))) as number;

  return { ...user, id };
}

export async function getUser(email: string): Promise<User | undefined> {
  const store = await userStore();

  return withRole(await request<User | undefined>(store.index("email_idx").get(email)));
}

export async function getUserById(id: number): Promise<User | undefined> {
  const store = await userStore();

  return withRole(await request<User | undefined>(store.get(id)));
}
