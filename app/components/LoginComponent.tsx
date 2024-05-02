"use client";

import { useEffect } from "react";
import queryString from "query-string";

export default function LoginComponent() {
  useEffect(() => {
    const state = generateRandomString(16);
    localStorage.setItem("spotify_auth_state", state);

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URL;
    const scope = encodeURIComponent("user-top-read");

    const authUrl = "https://accounts.spotify.com/authorize?" +
      queryString.stringify({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
      });
    window.location.href = authUrl;
  }, []);

  return null;
};

function generateRandomString(length: number) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}