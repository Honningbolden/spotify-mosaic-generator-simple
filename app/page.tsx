
import Canvas from "./components/Canvas";
import { Suspense } from "react";

export default function Home() {

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Canvas />
      </Suspense>
    </div>
  );
}
