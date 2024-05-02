"use client";

import p5 from "p5";
import { ReactP5Wrapper, Sketch, SketchProps } from "react-p5-wrapper";
import getAlbumCovers from "./album-data";

const sketch: Sketch = p5 => {
  let preloadDone = false;

  const MAX_DEPTH = 5;
  let bgImg;
  let albumCovers = [];

  

  p5.preload = () => {
    let images;

    (async () => {
      const fetchPromises = [];
      for (let i = 0; i < 1; i++) {
        fetchPromises.push(getAlbumCovers(50 * i));
      }
  
      const results = await Promise.all(fetchPromises);
      const combinedData = results.flat();
      images = combinedData.map((cover) => cover.album.images[0].url);
      console.log("done fetching");
    })();

    console.log("images download");
    console.log(images);

    bgImg = p5.loadImage("/images/background.png", (img) => {
      bgImg = img;
      bgImg.loadPixels();
      console.log("bgImg", bgImg)
    });

    for (let i = 1; i < images.length; i++) {
      albumCovers.push(
        p5.loadImage(images[i], (img) => {
          img.loadPixels();
          img.average = calcAverageColor(img.pixels);
          img.usageCount = 0;
        })
      );
    }
  }

  p5.setup = () => {
    p5.createCanvas(1024, 1024);

    let quadtree = new Quadtree(0, 0, p5.width, p5.height);
    quadtree.splitIfNeeded();
    quadtree.display();
  }

  // calcColorValues
  const calcAverageColor = (pixels: number[]) => {
    let r = 0, g = 0, b = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i] * pixels[i];
      g += pixels[i + 1] * pixels[i + 1];
      b += pixels[i + 2] * pixels[i + 2];
    }

    let pixelCount = pixels.length / 4;
    return p5.color(p5.sqrt(r / pixelCount), p5.sqrt(g / pixelCount), p5.sqrt(b / pixelCount));
  }

  // Quadtree

  interface Bounds {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  interface Image extends p5.Image {
    average: p5.Color;
    usageCount: number;
  }

  class Quadtree {
    bounds: Bounds;
    children: Quadtree[];
    depth: number;
    color: p5.Color;
    image: Image | null;
    threshold: number;

    constructor(x: number, y: number, w: number, h: number, depth = 0) {
      this.bounds = {
        x: x,
        y: y,
        w: w,
        h: h,
      };
      this.children = [];
      this.depth = depth;
      this.color = this.calculateAverageColor(x, y, w, h);
      this.image = null;
      this.threshold = 10;
    }

    subdivide() {
      const { x, y, w, h } = this.bounds;
      const halfW = Math.floor(w / 2);
      const halfH = Math.floor(h / 2);

      this.children.push(new Quadtree(x, y, halfW, halfH, this.depth + 1));
      this.children.push(new Quadtree(x + halfW, y, halfW, halfH, this.depth + 1));
      this.children.push(new Quadtree(x, y + halfH, halfW, halfH, this.depth + 1));
      this.children.push(new Quadtree(x + halfW, y + halfH, halfW, halfH, this.depth + 1));

      for (let child of this.children) {
        child.splitIfNeeded();
      }
    }

    calculateAverageColor(x: number, y: number, w: number, h: number) {
      let r = 0,
        g = 0,
        b = 0;
      let sampleCount = 0;

      const samplingSize = Math.max(1, Math.floor(Math.sqrt(w * h) / 10));

      for (let j = x; j < x + w; j += samplingSize) {
        for (let i = y; i < y + h; i += samplingSize) {
          let c = bgImg.get(j, i);

          r += p5.red(c);
          g += p5.green(c);
          b += p5.blue(c);

          sampleCount++;
        }
      }

      return p5.color(Math.floor(r / sampleCount), Math.floor(g / sampleCount), Math.floor(b / sampleCount));
    }

    checkColorVariance(): boolean {
      const { x, y, w, h } = this.bounds;
      const halfW = w / 2;
      const halfH = h / 2;
      const colors = [
        this.calculateAverageColor(x, y, halfW, halfH),
        this.calculateAverageColor(x + halfW, y, halfW, halfH),
        this.calculateAverageColor(x, y + halfH, halfW, halfH),
        this.calculateAverageColor(x + halfW, y + halfH, halfW, halfH),
      ];

      let avg = this.color;
      return colors.some((subColor) => this.colorDifference(subColor, avg) > this.threshold);
    }

    colorDifference(c1: p5.Color, c2: p5.Color): number {
      let d = p5.dist(p5.red(c1), p5.green(c1), p5.blue(c1), p5.red(c2), p5.green(c2), p5.blue(c2));
      return d;
    }

    splitIfNeeded(): void {
      let colorChange = this.checkColorVariance();
      if (this.depth < MAX_DEPTH && colorChange) {
        // console.log("Splitting due to significant color variance");
        this.subdivide();
      } else {
        // console.log("No significant variance or max depth reached, assigning cover");
        this.image = this.findClosestAlbumCover();
      }
    }

    findClosestAlbumCover(): Image | null {
      let minDiff = Infinity;
      let closestCover = null;
      let totalUsage = albumCovers.reduce((acc, cover) => acc + cover.usageCount, 0);
      let weights = albumCovers.map((cover) => 1 / (1 + cover.usageCount));
      let totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

      albumCovers.forEach((cover, index) => {
        let diff = this.colorDifference(this.color, cover.average);
        let weightedDiff = diff * (totalWeight / weights[index]);

        if (weightedDiff < minDiff) {
          minDiff = weightedDiff;
          closestCover = cover;
        }
      });

      if (closestCover) {
        closestCover.usageCount++;
      }

      // console.log("closestCover", closestCover, closestCover.usageCount);
      return closestCover;
    }

    display(): void {
      if (this.image) {
        p5.image(this.image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
      } else {
        for (let child of this.children) {
          child.display();
        }
      }
    }
  }
}

export default function P5Sketch() {
  return <ReactP5Wrapper sketch={sketch} />;
}