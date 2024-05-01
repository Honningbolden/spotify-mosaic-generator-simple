"use client"

import { useEffect, useState } from "react";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUrl = process.env.SPOTIFY_REDIRECT_URL;

const token = process.env.NEXT_PUBLIC_TOKEN;

async function getAlbumCovers() {
  const res = await fetch("https://api.spotify.com/v1/me/top/tracks", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return data;
}

export default function Canvas() {
  const [albumData, setAlbumData] = useState(null);

  useEffect(() => {
    getAlbumCovers().then(data => {
      console.log(data);
      setAlbumData(data);
    })
  }, [])

  return (
    <div>
      <h1>test</h1>
    </div>
  );
}