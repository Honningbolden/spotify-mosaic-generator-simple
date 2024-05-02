"use server";

export default async function getAlbumCovers(token: string, offset: number) {
  const params = new URLSearchParams({
    time_range: "long_term",
    limit: "50",
    offset: offset.toString(),
  })

  console.log("token", token);
  
  const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  console.log("data", data)

  return data.items;
}