let video;
let handpose;
let predictions = [];
let hammer;
let centerPoint;
let inputDot;
let platforms;
let viewport;

function preload(){
  //preload background image
  bgImage = loadImage('Data/bg.png');
}
function setup() {
  createCanvas(4096, 4096);


  // Setup video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video feed

  // Setup handpose model
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    predictions = results;
  });
  //https://learn.ml5js.org/#/reference/handpose
  //reference

  // Create hammer sprite
  hammer = createSprite(windowWidth / 2, windowHeight / 2, 10, 50);
  hammer.shapeColor = color(128); // Color of the hammer

  // Center point
  centerPoint = createVector(windowWidth / 2, windowHeight / 2);

  // Input dot
  inputDot = createVector(windowWidth / 2, windowHeight / 2);

  //Create data array for platforms
  platforms = [
    //{ x: 0 * 4, y: 715 * 4, width: 1024 * 4, height: 307 * 4 },
    { x: 302 * 4, y: 602 * 4, width: 112 * 4, height: 26 * 4 },
    { x: 615 * 4, y: 572 * 4, width: 111 * 4, height: 41 * 4 },
    { x: 623 * 4, y: 477 * 4, width: 110 * 4, height: 51 * 4 },
    { x: 629 * 4, y: 451 * 4, width: 88 * 4, height: 24 * 4 },
    { x: 523 * 4, y: 425 * 4, width: 109 * 4, height: 37 * 4 },
    { x: 412 * 4, y: 363 * 4, width: 115 * 4, height: 59 * 4 },
    { x: 556 * 4, y: 351 * 4, width: 234 * 4, height: 79 * 4 },
    { x: 201 * 4, y: 328 * 4, width: 213 * 4, height: 61 * 4 },
    { x: 335 * 4, y: 314 * 4, width: 39 * 4, height: 15 * 4 },
    { x: 557 * 4, y: 280 * 4, width: 140 * 4, height: 71 * 4 },
    { x: 95 * 4, y: 266 * 4, width: 320 * 4, height: 34 * 4 },
    { x: 167 * 4, y: 238 * 4, width: 84 * 4, height: 36 * 4 },
    { x: 439 * 4, y: 195 * 4, width: 376 * 4, height: 73 * 4 },
    { x: 441 * 4, y: 151 * 4, width: 104 * 4, height: 45 * 4 },
    { x: 100 * 4, y: 155 * 4, width: 306 * 4, height: 30 * 4 }
  ];


  // Create platform sprites based on data
  for (let plat of platforms) {
    let sprite = createSprite(plat.x + plat.width/2, plat.y + plat.height/2, plat.width, plat.height);
    sprite.immovable = true;  //platforms should not move when collided with
    
    sprite.shapeColor = color(128,128,128,90)
  }


  let viewportWidth = 3072;
  let scaleRatio = windowWidth / viewportWidth;
  let scaledCanvasHeight = height * scaleRatio;
  let viewportHeight = windowHeight / scaleRatio;

  viewport = {
    x: 0,
    y: max(0, height - scaledCanvasHeight),
    width: viewportWidth,
    height: viewportHeight
  };
}


function modelReady() {//function for when hand recognition model is ready
  console.log("Model ready!");
}

function draw() {
  push();

  let imageAspectRatio = bgImage.height / bgImage.width;
  let scaledImageHeight = windowWidth * imageAspectRatio;

  let imageY = windowHeight - scaledImageHeight;

  viewport.y = max(0, scaledImageHeight - windowHeight);

  let scaleRatio = windowWidth / viewport.width;
  translate(-viewport.x * scaleRatio, -viewport.y * scaleRatio); //adjust canvas based on the viewport
  
  scale(scaleRatio); // scale the viewport to fit the window width

  background(255);
  
  image(bgImage, 0, imageY, windowWidth, scaledImageHeight);
  //draw the background image adjusted to fill width and show the bottom left

  for (let plat of platforms) {//Displaying the platforms
    fill(0,0,0);  // Placeholder color for platforms to calibrate location
    //rect(plat.x - plat.width/2, plat.y - plat.height/2, plat.width, plat.height);
  }

  // Check if there are any hand predictions
  if (predictions.length > 0) {
    let wrist = predictions[0].landmarks[0]; // Wrist position (landmark 0)

    // Mirroring the x-coordinate
    let wristX = video.width - wrist[0];
    let wristY = wrist[1];

    // Map the detected wrist coordinates to canvas
    let mappedX = map(wristX, 0, video.width, 0, windowWidthwidth);
    let mappedY = map(wristY, 0, video.height, 0, windowHeight);

    /// Debugging: printing out wristX and mappedX
    console.log(wristX, " ", mappedX);


    // Calculate input dot position based on wrist position
    let inputVector = createVector(mappedX, mappedY);
    inputVector.sub(centerPoint);
    inputVector.limit(350); // Adjust the radius limit as needed
    inputDot.set(centerPoint.x + inputVector.x, centerPoint.y + inputVector.y);

    // Draw a dot representing the wrist's position
    fill(255, 0, 0); // Red color for the dot
    ellipse(inputDot.x, inputDot.y, 20, 20);

    // Update hammer position to follow the dot
    hammer.position.x = inputDot.x;
    hammer.position.y = inputDot.y;
  }

  // Draw character, obstacles, and hammer
  drawCharacter();
  drawObstacles();
  drawSprites(); // This will draw the hammer sprite

  pop();
  
}//end of draw


function drawCharacter() {
  // Simple character drawing
  fill(255, 0, 0);
  ellipse(centerPoint.x, centerPoint.y + 200, 50, 50); // Head
  fill(0, 0, 255);
  rect(centerPoint.x - 25, centerPoint.y + 170, 50, 60); // Pot
}

function drawObstacles() {
  // Simple obstacles (static for this example)
  fill(0, 255, 0);
  rect(100, height - 150, 100, 20); // Obstacle 1
  rect(300, height - 250, 100, 20); // Obstacle 2


}