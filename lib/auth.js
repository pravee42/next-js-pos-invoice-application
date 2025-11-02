"use client";

import Cookies from "js-cookie";

const TOKEN_KEY = "token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token) {
  Cookies.set(TOKEN_KEY, token, {
    expires: 30,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}

export function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (err) {
    return null;
  }
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}

export function isAuthenticated() {
  return !!getToken();
}

