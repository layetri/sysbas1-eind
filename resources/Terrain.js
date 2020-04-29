class Terrain {
    constructor(size) {
        this.x = 0;
        this.y = 0;
        this.z = -(height/2) + 70;
        this.width = size;
        this.depth = size;
        this.slope = 90;
        this.c = [];
    }
    init(index) {
        if(index > 0) {
            // Function that calculates the Y axis position of a chunk based on its surroundings.
            let XY = 0;
            // get a Y value for the Z ray
            let ZY = random(world.planes[index - 1].y - 20, world.planes[index - 1].y + 20);
            // get a Y value for the X ray
            if(index > world.size / world.planeSize) {
                let preX = world.planes[index - (world.size / world.planeSize)];
                XY = random(preX.y - 20, preX.y + 20);
            }

            // take an average
            this.y = Math.floor((ZY + XY) / 2);
        }

        // Assign X and Z axis position
        this.x = rayX;
        this.z = rayZ;

        if(nightMode) {
            this.c = world.planes[0].c;
        } else {
            this.c = [100, 230 - this.y, 100];
        }
    }
    draw() {
        push();
        rectMode(CENTER);
        noStroke();

        // If night mode is active, modify colors accordingly
        if(nightMode) {
            if(this.c[0] < 186 - this.y) {
                this.c[0] += 2;
            }
            if(this.c[1] > 0) {
                this.c[1] -= 2;
            }
            if(this.c[2] < 175 - this.y) {
                this.c[2] += 2;
            }
        }

        // Predefine the terrain
        ambientMaterial(this.c);
        translate(this.x, this.y + this.width/2, this.z);
        rotateX(this.slope);

        // Draw the terrain
        box(this.width);
        pop();
    }
}