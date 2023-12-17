let bgImage;
let worldx, worldy;
let shiftx, shifty;
let platformSprites = []; // Array to hold the sprites
let character;
let GRAVITY = 0.8;
let JUMPF = -25;
let MOVEF = 2.3;
let onGround = false;
let FRIC=.85;//friction
let hforce;//horizontal force
let haccel;//horizontal accel  
let MAX_SPEED=18; 
let lastJumpTime = 0;
let BOOST_DOUBLE_JUMP_INTERVAL = 200; //200ms limit for a REALLY powerful 2nd jump
let REG_DOUBLE_JUMP_INTERVAL=600; //600ms limit for regular double jumps
let isAPressed = false;
let isDPressed = false;
let canDoubleJump;

let noiseC;//noise level
let noiseCT;//noise level trigger sprite
let noiseCanvas

function preload(){
    //preload background image
    bgImage = loadImage('Data/bg.png');
}

function setup(){
    let originalbgW=bgImage.width;

    bgImage.resize(windowWidth*4/3, 0); // resize image to show 3/4 of its width in browser window

    let canvasWidth = windowWidth; //canvas same size as window

    // Calculate the canvas height based on the window's aspect ratio
    let canvasHeight = canvasWidth * (windowHeight / windowWidth);

    createCanvas(canvasWidth, canvasHeight);
    print(windowWidth, windowHeight, "window Width + Height");
    print(canvasWidth, canvasHeight, "canvas Width + Height");

    let scale=windowWidth*4/3/originalbgW;
    print("scale "+ scale);

    platforms = [
        //{ x: 0 * scale, y: 715 * scale, width: 1024 * scale, height: 307 * scale },
        
        { x: 105 * scale, y: 160 * scale, width: 300 * scale, height: 28 * scale },
        { x: 442 * scale, y: 193 * scale, width: 370.5 * scale, height: 26 * scale },
        { x: 96 * scale, y: 273 * scale, width: 317 * scale, height: 26 * scale }, 
        { x: 872 * scale, y: 295 * scale, width: 151 * scale, height: 28 * scale },
        { x: 203 * scale, y: 329 * scale, width: 210 * scale, height: 27 * scale },
        { x: 558 * scale, y: 350 * scale, width: 230 * scale, height: 26 * scale },
        { x: 413 * scale, y: 383 * scale, width: 112 * scale, height: 26 * scale },
        { x: 781 * scale, y: 409 * scale, width: 175 * scale, height: 32 * scale },
        { x: 525 * scale, y: 425 * scale, width: 105 * scale, height: 26 * scale },
        { x: 0 * scale, y: 440 * scale, width: 212 * scale, height: 32 * scale },
        { x: 627 * scale, y: 474 * scale, width: 104 * scale, height: 30 * scale },
        { x: 198 * scale, y: 515 * scale, width: 112 * scale, height: 28 * scale },
        { x: 727 * scale, y: 515 * scale, width: 120 * scale, height: 30 * scale },
        { x: 618 * scale, y: 570 * scale, width: 108 * scale, height: 25 * scale },
        { x: 302 * scale, y: 602 * scale, width: 112 * scale, height: 25 * scale },
        { x: 0 * scale, y: 613 * scale, width: 116 * scale, height: 32 * scale },
        { x: 894 * scale, y: 613 * scale, width: 133 * scale, height: 31 * scale },
        { x: 653 * scale, y: 629 * scale, width: 115 * scale, height: 26 * scale },
        { x: 246 * scale, y: 660 * scale, width: 121 * scale, height: 26 * scale },
        { x: 544.5 * scale, y: 683 * scale, width: 311.5 * scale, height: 26 * scale },
        { x: 0 * scale, y: 719 * scale, width: 502 * scale, height: 26 * scale },
        { x: 673 * scale, y: 796 * scale, width: 351 * scale, height: 31 * scale },
        { x: 306 * scale, y: 936 * scale, width: 87 * scale, height: 41 * scale },
        { x: 0 * scale, y: 977 * scale, width: 1024 * scale, height: 47 * scale },
        { x: 0 * scale, y: 933 * scale, width: 35 * scale, height: 47 * scale },
        { x: 185 * scale, y: 863 * scale, width: 75 * scale, height: 30 * scale },
        { x: 29 * scale, y: 896.5 * scale, width: 171 * scale, height: 26 * scale },

      ];

    // Create platform sprites based on data
    for (let plat of platforms) {
        let sprite = createSprite(plat.x+plat.width/2, plat.y+plat.height/2, plat.width, plat.height, 'static');
        //sprite.immovable = true;  //platforms should not move when collided with
        sprite.shapeColor = color(255,0,0,180);
        platformSprites.push(sprite); // Store the sprite
    }



    platformSprites[platformSprites.length - 1].rotation = -24.2;

    character = createSprite(width * 0.1, width * 1.25, 50);
    character.shapeColor = color(255, 0, 0); // Set the color or add an image
    character.velocity.x = 0;
    character.velocity.y = 0;
    

    //stuff for making noise...
    let input = new p5.AudioIn();
    input.start();
    

    //initialize trigger sprite
    noiseCT = createSprite(width*.83, width*.73, width/40, width/40);
    noiseCT.shapeColor = color(0, 255, 0,128); //green

    noiseC = new NoiseChallenge(input, noiseCT);//noise challenge
    /*i had a lot of trouble getting the trigget to work and could
    never figure out. I asked chatgpt and learned that I had to 
    initialize noiseCT before noiseC; 
    
    I moved the noiseC line up for a bit because I thought it would 
    make more sense to create the level before the trigger sprite, 
    but that's EXACTLY what broke it
    */ 
    
    noiseCanvas=createGraphics(2000,1000);
    noiseCanvas.background(255);
    //https://stackoverflow.com/questions/37240287/can-i-create-multiple-canvas-elements-on-same-page-using-p5js
    /*through a lot of headache and digging around I found 
    a way to draw other graphics in a pseudo canvas on top 
    of my already existing canvas, without needing me to actually
    create one*/
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
    checkPlatformCollisions(); // check for collisions

    drawSprites();
    pop();

    noiseC.update(character,noiseCanvas);

    if (noiseC.active){
        character.velocity.x=0;
        character.velocity.y=0;
        image(noiseCanvas, (width - noiseCanvas.width) / 2, (height - noiseCanvas.height) / 2);
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
        if (currentTime - lastJumpTime <= BOOST_DOUBLE_JUMP_INTERVAL){
            character.velocity.y = JUMPF - 18; // Boosted double jump
        } else if (currentTime-lastJumpTime<=REG_DOUBLE_JUMP_INTERVAL){
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
        character.velocity.x-=MOVEF;
    }
    if (isDPressed) {
        character.velocity.x+=MOVEF;
    }

    //friction
    if (onGround && character.velocity.x != 0) {
        character.velocity.x*=FRIC;
    }

    //limits velocity
    character.velocity.x=constrain(character.velocity.x, -MAX_SPEED, MAX_SPEED);
}



function checkPlatformCollisions() {
    onGround = false;

    for (let sprite of platformSprites) {
        character.collide(sprite, function() {
            if (character.velocity.y >= 0) { // Check if character is falling
                onGround = true;
                canDoubleJump = true; // Reset double jump on landing
                character.velocity.y = 0; // Stop downward movement
            }
        });
    }
}