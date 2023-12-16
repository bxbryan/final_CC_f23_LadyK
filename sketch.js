let bgImage;
let worldx, worldy;
let shiftx, shifty;
let platformSprites = []; // Array to hold the sprites
let character;
const GRAVITY = 0.5;
const JUMPF = -15;
const MOVEF = 2;
let onGround = false;
const FRIC=.85;//friction
let hforce;//horizontal force
let haccel;//horizontal accel  
const MAX_SPEED=10; 
let lastJumpTime = 0;
const DOUBLE_JUMP_INTERVAL = 500; //500ms

function preload(){
    //preload background image
    bgImage = loadImage('Data/bg.png');
  }

  function setup(){
    createCanvas(windowWidth, windowHeight);
    bgImage.resize(4096,0);
    worldx = bgImage.width/2;
    worldy = bgImage.height/2;

    platforms = [
        //{ x: 0 * 4, y: 715 * 4, width: 1024 * 4, height: 307 * 4 },
        
        { x: 105 * 4, y: 160 * 4, width: 300 * 4, height: 28 * 4 },
        { x: 442 * 4, y: 193 * 4, width: 370.5 * 4, height: 26 * 4 },
        { x: 96 * 4, y: 273 * 4, width: 317 * 4, height: 26 * 4 }, 
        { x: 872 * 4, y: 295 * 4, width: 151 * 4, height: 28 * 4 },
        { x: 203 * 4, y: 329 * 4, width: 210 * 4, height: 27 * 4 },
        { x: 558 * 4, y: 350 * 4, width: 230 * 4, height: 26 * 4 },
        { x: 413 * 4, y: 383 * 4, width: 112 * 4, height: 26 * 4 },
        { x: 781 * 4, y: 409 * 4, width: 175 * 4, height: 32 * 4 },
        { x: 525 * 4, y: 425 * 4, width: 105 * 4, height: 26 * 4 },
        { x: 0 * 4, y: 440 * 4, width: 212 * 4, height: 32 * 4 },
        { x: 627 * 4, y: 474 * 4, width: 104 * 4, height: 30 * 4 },
        { x: 198 * 4, y: 515 * 4, width: 112 * 4, height: 28 * 4 },
        { x: 727 * 4, y: 515 * 4, width: 120 * 4, height: 30 * 4 },
        { x: 618 * 4, y: 570 * 4, width: 108 * 4, height: 25 * 4 },
        { x: 302 * 4, y: 602 * 4, width: 112 * 4, height: 25 * 4 },
        { x: 0 * 4, y: 613 * 4, width: 116 * 4, height: 32 * 4 },
        { x: 894 * 4, y: 613 * 4, width: 133 * 4, height: 31 * 4 },
        { x: 653 * 4, y: 629 * 4, width: 115 * 4, height: 26 * 4 },
        { x: 246 * 4, y: 660 * 4, width: 121 * 4, height: 26 * 4 },
        { x: 544.5 * 4, y: 683 * 4, width: 311.5 * 4, height: 26 * 4 },
        { x: 0 * 4, y: 719 * 4, width: 502 * 4, height: 26 * 4 },
        { x: 673 * 4, y: 796 * 4, width: 351 * 4, height: 31 * 4 },
        { x: 306 * 4, y: 936 * 4, width: 87 * 4, height: 41 * 4 },
        { x: 0 * 4, y: 977 * 4, width: 1024 * 4, height: 47 * 4 },
        { x: 0 * 4, y: 933 * 4, width: 35 * 4, height: 47 * 4 },
        { x: 185 * 4, y: 863 * 4, width: 75 * 4, height: 30 * 4 },
        { x: 29 * 4, y: 896.5 * 4, width: 171 * 4, height: 26 * 4 },

      ];

    // Create platform sprites based on data
    for (let plat of platforms) {
        let sprite = createSprite(plat.x+plat.width/2, plat.y+plat.height/2, plat.width, plat.height, 'static');
        //sprite.immovable = true;  //platforms should not move when collided with
        sprite.shapeColor = color(255,0,0,180);
        platformSprites.push(sprite); // Store the sprite
    }



    platformSprites[platformSprites.length - 1].rotation = -24.2;

    character = {
        x: width / 2,
        y: height / 2,
        w: 50,
        h: 50,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: GRAVITY
    };
  }

  

  function draw(){
    background(0);
    shiftx = width / 2 - worldx;
    shifty = height / 2 - worldy;

    push();
    translate(shiftx, shifty);
    image(bgImage, 0, 0);

    handleCharacter();//handle character movement and physics

    checkPlatformCollisions();//check for collisions

    // draw character
    fill(255, 0, 0);
    ellipse(character.x, character.y, character.w, character.h);

    drawSprites();
    pop();
  }
    

  function keyPressed() {
    let currentTime = millis();

    if (key === ' ' && (onGround || (canDoubleJump && currentTime - lastJumpTime < DOUBLE_JUMP_INTERVAL))) {
        character.vy = JUMPF;

        if (!onGround) {
            canDoubleJump = false; // Disable further double jumps
        }

        lastJumpTime = currentTime; // Record the time of the jump
    }
    
    if (key === ' ' && onGround) {
        character.vy = JUMPF;
        onGround = false;
    }
    if (key === 'a') {
        character.ax = -MOVEF; // Accelerate left
    }
    if (key === 'd') {
        character.ax = MOVEF; // Accelerate right
    }
}

function keyReleased() {
    if (key === 'a' || key === 'd') {
        character.ax = 0; // Stop accelerating when key is released
    }
}

function handleCharacter() {
    // Apply gravity
    character.vy += GRAVITY;

    // Apply horizontal acceleration
    character.vx += character.ax;

    // Apply friction when on the ground and not moving horizontally
    if (onGround && character.ax === 0) {
        character.vx *= FRIC;
    }

    // Limit velocity to prevent excessive speed
    character.vx = constrain(character.vx, -MAX_SPEED, MAX_SPEED);

    // Update position
    character.x += character.vx;
    character.y += character.vy;

    if (onGround){
        canDoubleJump = true;
    }

    
}

  function checkPlatformCollisions(){
    //reset onGround flag
    onGround = false;

    //collision detection with platforms
    
    for (let sprite of platformSprites) {
        // Check collision with sides
        if (character.x + character.w / 2 > sprite.position.x - sprite.width / 2 &&
            character.x - character.w / 2 < sprite.position.x + sprite.width / 2) {
            
            // Check collision with bottom
            if (character.y - character.h / 2 < sprite.position.y + sprite.height / 2 &&
                character.y - character.h / 2 > sprite.position.y) {
                character.vy *= -1; // Reverse vertical velocity
            }
    
            // Check collision with top
            else if (character.y + character.h / 2 > sprite.position.y - sprite.height / 2 &&
                     character.y + character.h / 2 < sprite.position.y) {
                character.y = sprite.position.y - sprite.height / 2 - character.h / 2; // Place character on top of platform
                character.vy = 0; // Stop vertical movement
                onGround = true; // Set onGround to true
            }
        }
    
        // Check collision with left and right sides
        if (character.y + character.h / 2 > sprite.position.y - sprite.height / 2 &&
            character.y - character.h / 2 < sprite.position.y + sprite.height / 2) {
            
            // Right side collision
            if (character.x - character.w / 2 < sprite.position.x + sprite.width / 2 &&
                character.x > sprite.position.x) {
                character.vx *= -1; // Reverse horizontal velocity
            }
    
            // Left side collision
            else if (character.x + character.w / 2 > sprite.position.x - sprite.width / 2 &&
                     character.x < sprite.position.x) {
                character.vx *= -1; // Reverse horizontal velocity
            }
        }
    }
    
}