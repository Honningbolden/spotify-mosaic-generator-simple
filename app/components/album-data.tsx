"use server";

const token = process.env.TOKEN;

export default async function getAlbumCovers() {
  const res = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return data.items;
}