"use client"

import { useEffect, useState } from "react";
import P5Sketch from "./p5canvas";
import Login from "./LoginComponent";
import { useSearchParams } from "next/navigation";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUrl = process.env.SPOTIFY_REDIRECT_URL;

interface AlbumCover {
  album: {
    images: { url: string }[];
  };
};

export default function Canvas() {
  const redirected = useSearchParams().get("redirected") !== null;

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add this line
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && redirected) {
      setIsLoggedIn(true);
    }
  })

  const handleLogin = () => {
    setIsLoggingIn(true);
  }

  if (isLoggingIn) {
    return <Login/>;
  }

  return (
    <main>
      {isLoggedIn ?
        <P5Sketch />
        :
        <button onClick={handleLogin}>Log in with Spotify</button>
      }
    </main>
  );
}