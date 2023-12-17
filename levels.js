class NoiseChallenge{
    constructor(input, noiseCT) {
        this.input = input;
        this.triggerSprite = noiseCT;
        this.active = false;
        this.greenCount = 0;
    }

    start(){
        this.active = true;
        //this.greenCount = 0;
        // additional setup if needed
    }

    update(character,noiseCanvas){
        if (character.overlap(this.triggerSprite)){
            this.start();
            this.noiseCanvas=noiseCanvas;
            //noiseCanvas.background(0,0,255);
        }

        if (!this.active) return;

        this.drawLevel();
        
    }

    drawLevel(){
        let vol = this.input.getLevel();
        let threshold = 0.03;
        noiseCanvas.stroke(0, 0, 0, 120);
        

        if (vol > threshold){
            //console.log("NOISEEEEEE!")
            noiseCanvas.fill(0, 255, 0, 120);
            let mapped = map(vol, 0, 1, 55, 600);
            noiseCanvas.ellipse(random(0, noiseCanvas.width), random(0,noiseCanvas.height), mapped, mapped);
            this.greenCount += 1;
            //console.log("vol",vol," gc",this.greenCount);

        } else if (vol < threshold){
            noiseCanvas.fill(255);
            let mapped = map(vol, 0, 1, 30, 600);
            noiseCanvas.ellipse(random(0, noiseCanvas.width), random(0,noiseCanvas.height), mapped, mapped);
        }

        if (this.greenCount > 100){
            this.active = false;
            noiseCanvas.clear();
            //transition back to main game
        }
    }
}