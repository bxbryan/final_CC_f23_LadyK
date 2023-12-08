let video;
let handpose;
let predictions = [];
let hammer;
let centerPoint;
let inputDot;

function setup() {
  createCanvas(windowWidth, windowHeight);

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
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  background(255);

  // Check if there are any hand predictions
  if (predictions.length > 0) {
    let wrist = predictions[0].landmarks[0]; // Wrist position (landmark 0)

    // Mirroring the x-coordinate
    let wristX = video.width - wrist[0];
    let wristY = wrist[1];

    // Map the detected wrist coordinates to canvas
    let mappedX = map(wristX, 0, video.width, 0, width);
    let mappedY = map(wristY, 0, video.height, 0, height);

    /// Debugging: printing out wristX and mappedX
    console.log(wristX, " ", mappedX);

    // Calculate input dot position based on wrist position
    let inputVector = createVector(mappedX, mappedY);
    inputVector.sub(centerPoint);
    //inputVector.limit(350); // Adjust the radius limit as needed
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
}

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