let bgImage;
let worldx, worldy;
let shiftx, shifty;
let platformSprites = []; // Array to hold the sprites
let character;
let GRAVITY = 0.8;
let JUMPF = -25;
let MOVEF = 2.3;
let onGround = false;
let FRIC = .85;//friction
let hforce;//horizontal force
let haccel;//horizontal accel  
let MAX_SPEED = 18;
let lastJumpTime = 0;
let BOOST_DOUBLE_JUMP_INTERVAL = 200; //200ms limit for a REALLY powerful 2nd jump
let REG_DOUBLE_JUMP_INTERVAL = 600; //600ms limit for regular double jumps
let isAPressed = false;
let isDPressed = false;
let canDoubleJump;

let noiseC;//noise level
let noiseCT;//noise level trigger sprite
let noiseCanvas;

let noiseC2;
let noiseCT2;
let noiseCanvas2;

function preload() {
    //preload background image
    bgImage = loadImage('Data/bg.png');
}

function setup() {
    let originalbgW = bgImage.width;

    bgImage.resize(windowWidth * 4 / 3, 0); // resize image to show 3/4 of its width in browser window

    let canvasWidth = windowWidth; //canvas same size as window

    // Calculate the canvas height based on the window's aspect ratio
    let canvasHeight = canvasWidth * (windowHeight / windowWidth);

    createCanvas(canvasWidth, canvasHeight);
    print(windowWidth, windowHeight, "window Width + Height");
    print(canvasWidth, canvasHeight, "canvas Width + Height");

    let scale1 = windowWidth * 4 / 3 / originalbgW;
    print("scale1 " + scale1);

    platforms = [
        //{ x: 0 * scale1, y: 715 * scale1, width: 1024 * scale1, height: 307 * scale1 },

        { x: 105 * scale1, y: 160 * scale1, width: 300 * scale1, height: 28 * scale1 },
        { x: 442 * scale1, y: 193 * scale1, width: 370.5 * scale1, height: 26 * scale1 },
        { x: 96 * scale1, y: 273 * scale1, width: 317 * scale1, height: 26 * scale1 },
        { x: 872 * scale1, y: 295 * scale1, width: 151 * scale1, height: 28 * scale1 },
        { x: 203 * scale1, y: 329 * scale1, width: 210 * scale1, height: 27 * scale1 },
        { x: 558 * scale1, y: 350 * scale1, width: 230 * scale1, height: 26 * scale1 },
        { x: 413 * scale1, y: 383 * scale1, width: 112 * scale1, height: 26 * scale1 },
        { x: 781 * scale1, y: 409 * scale1, width: 175 * scale1, height: 32 * scale1 },
        { x: 525 * scale1, y: 425 * scale1, width: 105 * scale1, height: 26 * scale1 },
        { x: 0 * scale1, y: 440 * scale1, width: 212 * scale1, height: 32 * scale1 },
        { x: 627 * scale1, y: 474 * scale1, width: 104 * scale1, height: 30 * scale1 },
        { x: 198 * scale1, y: 515 * scale1, width: 112 * scale1, height: 28 * scale1 },
        { x: 727 * scale1, y: 515 * scale1, width: 120 * scale1, height: 30 * scale1 },
        { x: 618 * scale1, y: 570 * scale1, width: 108 * scale1, height: 25 * scale1 },
        { x: 302 * scale1, y: 602 * scale1, width: 112 * scale1, height: 25 * scale1 },
        { x: 0 * scale1, y: 613 * scale1, width: 116 * scale1, height: 32 * scale1 },
        { x: 894 * scale1, y: 613 * scale1, width: 133 * scale1, height: 31 * scale1 },
        { x: 653 * scale1, y: 629 * scale1, width: 115 * scale1, height: 26 * scale1 },
        { x: 246 * scale1, y: 660 * scale1, width: 121 * scale1, height: 26 * scale1 },
        { x: 544.5 * scale1, y: 683 * scale1, width: 311.5 * scale1, height: 26 * scale1 },
        { x: 0 * scale1, y: 719 * scale1, width: 502 * scale1, height: 26 * scale1 },
        { x: 673 * scale1, y: 796 * scale1, width: 351 * scale1, height: 31 * scale1 },
        { x: 306 * scale1, y: 936 * scale1, width: 87 * scale1, height: 41 * scale1 },
        { x: 0 * scale1, y: 977 * scale1, width: 1024 * scale1, height: 47 * scale1 },
        { x: 0 * scale1, y: 933 * scale1, width: 35 * scale1, height: 47 * scale1 },
        { x: 185 * scale1, y: 863 * scale1, width: 75 * scale1, height: 30 * scale1 },
        { x: 29 * scale1, y: 896.5 * scale1, width: 171 * scale1, height: 26 * scale1 },

    ];

    //create platform sprites
    for (let plat of platforms) {
        let sprite = createSprite(plat.x + plat.width / 2, plat.y + plat.height / 2, plat.width, plat.height, 'static');
        sprite.immovable = true;  //platforms should not move when collided with
        sprite.shapeColor = color(0, 0, 0, 20);
        platformSprites.push(sprite); // Store the sprite
    }



    platformSprites[platformSprites.length - 1].rotation = -24.2;

    character = createSprite(width * 0.1, width * 1.25, 70);
    character.shapeColor = color(255, 0, 0); // Set the color or add an image
    character.velocity.x = 0;
    character.velocity.y = 0;


    //stuff for making noise...
    let input = new p5.AudioIn();
    input.start();



    //initialize trigger sprite
    noiseCT = createSprite(width * .83, width * .73, width / 30, width / 30);
    noiseCT.shapeColor = color(0, 255, 0, 128); //green

    noiseC = new NoiseChallenge(input, noiseCT, 0.03);//noise challenge
    /*i had a lot of trouble getting the trigget to work and could
    never figure out. I asked chatgpt and learned that I had to 
    initialize noiseCT before noiseC; 
    
    I moved the noiseC line up for a bit because I thought it would 
    make more sense to create the level before the trigger sprite, 
    but that's EXACTLY what broke it
    */

    noiseCanvas = createGraphics(2000, 1000);
    noiseCanvas.background(255);
    //https://stackoverflow.com/questions/37240287/can-i-create-multiple-canvas-elements-on-same-page-using-p5js
    /*through a lot of headache and digging around I found 
    a way to draw other graphics in a pseudo canvas on top 
    of my already existing canvas, without needing me to actually
    create one*/

    
    noiseCT2 = createSprite(width * .45, width * .92, width / 20, width / 40);
    noiseCT2.shapeColor = color(0, 0, 255, 128); //blue

    noiseC2 = new NoiseChallenge(input, noiseCT2, 0.15);
    noiseCanvas2 = createGraphics(2000, 1300);
    noiseCanvas2.background(255);
    
}


function modelReady() {//function for when hand recognition model is ready
    console.log("Model ready!");
}



function draw() {
    background(0);

    // Calculate desired camera position
    let cameraX = constrain(character.position.x - width / 2, 0, bgImage.width - width);
    let cameraY = constrain(character.position.y - height / 2, 0, bgImage.height - height);

    // Update shiftx and shifty based on camera position
    shiftx = -cameraX;
    shifty = -cameraY;

    push();
    translate(shiftx, shifty);
    image(bgImage, 0, 0);

    handleCharacter(); // handle character movement and physics
    checkPlatformCollision(); // check for collisions

    drawSprites();
    pop();

    noiseC.update(character, noiseCanvas);

    if (noiseC.active) {
        character.velocity.x = 0;
        character.velocity.y = 0;
        image(noiseCanvas, (width - noiseCanvas.width) / 2, (height - noiseCanvas.height) / 2);
    }

    
    noiseC2.update(character, noiseCanvas2);

    if (noiseC2.active) {
        character.velocity.x = 0;
        character.velocity.y = 0;
        image(noiseCanvas2, (width - noiseCanvas2.width) / 2, (height - noiseCanvas2.height) / 2);
    }
    
}




function keyPressed() {
    let currentTime = millis();

    // Regular Jump
    if (key === ' ' && onGround) {
        character.velocity.y = JUMPF;
        onGround = false;
        canDoubleJump = true; // Allow double jump
        lastJumpTime = currentTime;
    }
    // Double Jump
    else if (key === ' ' && canDoubleJump && !onGround) {
        if (currentTime - lastJumpTime <= BOOST_DOUBLE_JUMP_INTERVAL) {
            character.velocity.y = JUMPF - 16; // Boosted double jump
        } else if (currentTime - lastJumpTime <= REG_DOUBLE_JUMP_INTERVAL) {
            character.velocity.y = JUMPF; // Regular double jump
        }
        canDoubleJump = false; // Disable further double jumps
        lastJumpTime = currentTime;
    }

    // Movement keys
    if (key === 'a') {
        isAPressed = true;
    }
    if (key === 'd') {
        isDPressed = true;
    }
}



function keyReleased() {
    if (key === 'a') {
        isAPressed = false;
    }
    if (key === 'd') {
        isDPressed = false;
    }
}

function handleCharacter() {
    //apply gravity
    character.velocity.y += GRAVITY;

    // horizontal movement based on key presses
    if (isAPressed) {
        character.velocity.x -= MOVEF;
    }
    if (isDPressed) {
        character.velocity.x += MOVEF;
    }

    //friction
    if (onGround && character.velocity.x != 0) {
        character.velocity.x *= FRIC;
    }

    //limits velocity
    character.velocity.x = constrain(character.velocity.x, -MAX_SPEED, MAX_SPEED);
}



function checkPlatformCollision() {
    onGround = false;

    for (let sprite of platformSprites) {
        character.collide(sprite, function () {
            if (character.velocity.y >= 0) { // Check if character is falling
                onGround = true;
                canDoubleJump = true; // Reset double jump on landing
                character.velocity.y = 0; // Stop downward movement
            }
        });
    }
}