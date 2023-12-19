class NoiseChallenge {
    constructor(input, noiseCT, threshold) {
        this.input = input;
        this.triggerSprite = noiseCT;
        this.active = false;
        this.greenCount = 0;
        this.grayCount=0
        this.threshold=threshold;
    }

    start() {
        this.active = true;
        //this.greenCount = 0;
        // additional setup if needed
    }

    update(character, noiseCanvas) {
        if (character.overlap(this.triggerSprite)) {
            this.start();
            console.log("level started");
            this.noiseCanvas = noiseCanvas;
            //noiseCanvas.background(0,0,255);
        }

        if (!this.active) return;

        this.drawLevel();

    }

    drawLevel() {
        let vol = this.input.getLevel();
        let thres = this.threshold;
        console.log("thres is ",thres);
        console.log("vol is ",vol);
        this.noiseCanvas.stroke(0, 0, 0, 120);
        //text(`Volume: ${vol}`, 10, 20);


        if (vol > thres) {
            console.log("NOISEEEEEE!")
            this.noiseCanvas.fill(0, 255, 0, 120);
            let mapped = map(vol, 0, 1, 55, 600);
            this.noiseCanvas.ellipse(random(0, noiseCanvas.width), random(0, noiseCanvas.height), mapped, mapped);
            this.greenCount += 1;
            console.log("vol",vol," gc",this.greenCount);
            /*I spent about another 2 hours trynig to figure out 
            why not opening the console broke everything
            but simply could not, and I resurted to this in a lot of frustration*/

        } else if (vol < thres) {
            this.noiseCanvas.fill(255);
            let mapped = map(vol, 0, 1, 30, 600);
            this.noiseCanvas.ellipse(random(0, noiseCanvas.width), random(0, noiseCanvas.height), mapped, mapped);
            this.grayCount++;
        }

        if (this.greenCount > 100) {
            this.active = false;
            this.noiseCanvas.clear();
            //transition back to main game
        }
    }
}

class HandChallenge {
    constructor(handCT) {
        this.triggerSprite = handCT;
        this.handCircleSize = 0;
        this.randomCircleSize = random(500, 800);
        this.active = false;
        this.handpose = null;
        this.predictions = [];
        this.handCanvas = createGraphics(width, height);
    }

    start() {
        this.active = true;
        if (!this.handpose) {
            this.handpose = ml5.handpose(this.handCanvas, this.modelReady);
            this.handpose.on('predict', results => this.predictions = results);
        }
    }

    modelReady() {
        console.log("Handpose model ready!");
    }

    stop() {
        this.active = false;
        if (this.handpose) {
            // dispose of the handpose model
            this.handpose.removeAllListeners('predict');
            this.handpose = null;
        }
    }


    calculateHandSpread() {
        let totalSpread = 0;
        if (this.predictions.length > 0) {
            let hand = this.predictions[0]; // Assuming single hand
            let centerX = 0, centerY = 0;
            hand.landmarks.forEach(point => {
                centerX += point[0];
                centerY += point[1];
            });
            centerX /= hand.landmarks.length;
            centerY /= hand.landmarks.length;

            for (let i = 4; i <= 20; i += 4) {
                let fingerTip = hand.landmarks[i];
                let distance = dist(centerX, centerY, fingerTip[0], fingerTip[1]);
                totalSpread += distance;
            }
        }
        return totalSpread / 5; // return average spread
    }

    update(character) {
        if (character.overlap(this.triggerSprite) && !this.active) {
            this.start();
        } else if (!character.overlap(this.triggerSprite) && this.active) {
            this.stop();
        }

        if (!this.active) return;

        this.handCircleSize = this.calculateHandSpread();
        this.drawLevel();
    }

    drawLevel() {
        this.handCanvas.clear();
        
        if (this.active) {
            image(this.handCanvas, 0, 0);
        }
    }
}