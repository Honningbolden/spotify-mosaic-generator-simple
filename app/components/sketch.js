import p5 from "p5";

const Sketch = (p) => {

  const MAX_DEPTH = 5;
  let bgImg;
  let albumCovers = [];
  
  function preload() {
    bgImg = loadImage("/images/background.png", (img) => {
      bgImg = img;
      bgImg.loadPixels();
      console.log("bgImg.pixels is");
      console.log(bgImg.pixels);
    });
  
    for (let i = 1; i < 87; i++) {
      albumCovers.push(
        loadImage(`/images/File ${i}.jpeg`, (img) => {
          img.loadPixels();
          img.average = calcAverageColor(img.pixels);
          img.usageCount = 0;
          console.log("img.usageCount", img.usageCount);
        })
      );
    }
  }
  
  function setup() {
    createCanvas(1024, 1024);
  
    let quadtree = new Quadtree(0, 0, width, height);
    quadtree.splitIfNeeded();
    quadtree.display();
  }
  
  // calcColorValues
  const calcAverageColor = (pixels) => {
    let r = 0, g = 0, b = 0;
  
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i] * pixels[i];
      g += pixels[i + 1] * pixels[i + 1];
      b += pixels[i + 2] * pixels[i + 2];
    }
  
    let pixelCount = pixels.length / 4;
    return color(sqrt(r/pixelCount), sqrt(g/pixelCount), sqrt(b/pixelCount));
  }
  
  
  
  // Quadtree
  
  class Quadtree {
    constructor(x, y, w, h, depth = 0) {
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
  
    calculateAverageColor(x, y, w, h) {
      let r = 0,
        g = 0,
        b = 0;
      let sampleCount = 0;
  
      const samplingSize = Math.max(1, Math.floor(Math.sqrt(w * h) / 10));
  
      for (let j = x; j < x + w; j += samplingSize) {
        for (let i = y; i < y + h; i += samplingSize) {
          let c = bgImg.get(j, i);
  
          r += red(c);
          g += green(c);
          b += blue(c);
  
          sampleCount++;
        }
      }
  
      return color(Math.floor(r / sampleCount), Math.floor(g / sampleCount), Math.floor(b / sampleCount));
    }
  
    checkColorVariance() {
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
  
    colorDifference(c1, c2) {
      let d = dist(red(c1), green(c1), blue(c1), red(c2), green(c2), blue(c2));
      return d;
    }
  
    splitIfNeeded() {
      let colorChange = this.checkColorVariance();
      if (this.depth < MAX_DEPTH && colorChange) {
        console.log("Splitting due to significant color variance");
        this.subdivide();
      } else {
        console.log("No significant variance or max depth reached, assigning cover");
        this.image = this.findClosestAlbumCover();
      }
    }
  
    findClosestAlbumCover() {
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
  
      console.log("closestCover", closestCover, closestCover.usageCount);
      return closestCover;
    }
  
    display() {
      if (this.image) {
        image(this.image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
      } else {
        for (let child of this.children) {
          child.display();
        }
      }
    }
  }
}

export default Sketch;