'use server';

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";


export async function signup(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  //validate the email and password
  let errors = {};
  if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (password.trim().length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }
  
  //store it in the database (create a new user)
  const hashedPassword = hashUserPassword(password);

  try {
    const userId = createUser(email, hashedPassword);
    await createAuthSession(userId);
    redirect('/training');

  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      errors.email = 'An account with that email address already exists.';
      return { errors };
    }
    throw error;
  }
}

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');


  //check if the email and password match
  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "Email or password is incorrect.",
      },
    };
  }

  if (!verifyPassword(existingUser.password, password)) {
    return {
      errors: {
        email: "Email or password is incorrect.",
      },
    };
  }

  //create a new session
  await createAuthSession(existingUser.id);
  redirect('/training');
}

export async function logout() {
  await destroySession()
  redirect('/');
}