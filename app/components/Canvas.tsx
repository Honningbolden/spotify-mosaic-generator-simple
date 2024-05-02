"use client"

import { useEffect, useState } from "react";
import getAlbumCovers from "./album-data";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUrl = process.env.SPOTIFY_REDIRECT_URL;

interface AlbumCover {
  album: {
    images: { url: string }[];
  };
};

export default function Canvas() {
  const [albumCovers, setAlbumCovers] = useState<AlbumCover[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchPromises = [];
      for (let i = 0; i < 2; i++) {
        fetchPromises.push(getAlbumCovers(50 * i));
      }

      const results = await Promise.all(fetchPromises);
      const combinedData = results.flat();

      console.log(combinedData);
      setAlbumCovers(combinedData);
    };
    fetchData();
  }, [])

  const images = albumCovers.map((cover) => cover.album.images[0].url);

  return (
    <div>
      {images.map((url, index) => {
        return <img key={index} src={url} />
      })}
    </div>
  );
}