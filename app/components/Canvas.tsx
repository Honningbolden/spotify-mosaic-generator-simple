"use client"

import { useEffect, useState } from "react";
import getAlbumCovers from "./album-data";
import P5Sketch from "./p5canvas";

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
  const [loading, setLoading] = useState(true); // Add this line

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const fetchPromises = [];
      for (let i = 0; i < 2; i++) {
        fetchPromises.push(getAlbumCovers(50 * i));
      }

      const results = await Promise.all(fetchPromises);
      const combinedData = results.flat();

      console.log(combinedData);
      setAlbumCovers(combinedData);
      setLoading(false);
    };
    fetchData();
  }, [])

  const images = albumCovers.map((cover) => cover.album.images[0].url);
  console.log("images is", images);

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <P5Sketch images={images}/>
      {images.map((url, index) => {
        return <img key={index} src={url} />
      })}
    </div>
  );
}