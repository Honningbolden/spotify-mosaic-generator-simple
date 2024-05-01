"use server";

const token = process.env.TOKEN;

export default async function getAlbumCovers(offset: number) {
  const params = new URLSearchParams({
    time_range: "long_term",
    limit: "50",
    offset: offset.toString(),
  })

  const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return data.items;
}