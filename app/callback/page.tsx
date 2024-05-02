"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import queryString from "query-string";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [hasRun, setHasRun] = useState(false);
  // const code = useSearchParams().get("code") ?? undefined;
  // const state = useSearchParams().get("state") ?? undefined;
  // const error = useSearchParams().get("error") ?? undefined;

  const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URL;

  // useEffect(() => {
  //   if (!hasRun) {
  //     console.log("Effect running", state, code);

  //     if (!state) {
  //       console.log("Redirecting due to state mismatch");

  //       router.replace("/#" + queryString.stringify({ error: "state_mismatch" }));
  //     } else {

  //       // Assume this function checks for a cookie or state validity and gets called appropriately
  //       fetch("https://accounts.spotify.com/api/token", {
  //         method: "POST",
  //         headers: {
  //           "content-type": "application/x-www-form-urlencoded",
  //           Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
  //         },
  //         body: queryString.stringify({
  //           code: code,
  //           redirect_uri: REDIRECT_URI,
  //           grant_type: "authorization_code",
  //         }),
  //       })
  //         .then(response => response.json())
  //         .then(data => {
  //           console.log("access_token saved");
  //           console.log(data.access_token)
  //           localStorage.setItem("access_token", data.access_token)
  //           // Save the access token, refresh token, and expiration time to your app's state or to local storage
  //         })
  //         .catch(error => console.error(error));
  //     }

  //     setHasRun(true);
  //   }
  // }, [router, code, state, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, hasRun]); // Depend on router to re-run when route changes

  router.push("/?redirected=true");

  return (
    <div>
      <h1>You'll be redirected back soon.</h1>
    </div>
  )
}