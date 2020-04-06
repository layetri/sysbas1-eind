let player;
let terrain;
let world;
let rayX = 0;
let rayZ = 0;
let rayInvert = false;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    player = new Player();
    world = new World();
    world.init(800, 50);
}

function draw() {
    background(100);

    orbitControl();

    ambientLight(100);
    pointLight(250, 250, 250, width - 40, 40, 1);

    world.draw();

    if(keyIsDown(LEFT_ARROW)) {
        player.direction = "left";
        player.inertia();
    }
    if(keyIsDown(RIGHT_ARROW)) {
        player.direction = "right";
        player.inertia();
    }
    if(keyIsDown(UP_ARROW)) {
        player.direction = "up";
        player.inertia();
    }
    if(keyIsDown(DOWN_ARROW)) {
        player.direction = "down";
        player.inertia();
    }

    if(!keyIsPressed) {
        if(player.speed > 0) {
            player.speed -= 0.5;
        } else if(player.speed < 0) {
            player.speed += 0.5;
        }
    }

    player.move();
    player.rotate();
    player.draw();
}

// Classes
class Player {
    constructor() {
        this.color = {r: 255, g: 255, b: 255};
        this.rotation = {x: 0, y: 0, z: 0};
        this.position = {x: 0, y: 0, z: 0};
        this.speed = 0;
        this.angle = 0;
        this.direction = "left";
        this.maxSpeed = 10;
        this.size = 20;
    }
    draw() {
        rectMode(CENTER);
        noStroke();
        ambientMaterial(this.color.r, this.color.g, this.color.b);
        sphere(this.size);
    }
    rotate() {
        if(this.speed > 0) {
            this.angle += this.speed * 10;
        }
    }
    move() {
        this.gravity();
        translate(this.position.x, this.position.y, this.position.z);

        //console.log(this.position);

        if (this.direction === "left" && this.position.x > this.speed) {
            this.position.x -= this.speed;
            rotateZ(this.angle);
        } else if (this.direction === "right" && this.position.x < world.width - this.speed) {
            this.position.x += this.speed;
            rotateZ(-this.angle);
        } else if (this.direction === "up" && this.position.z > this.speed) {
            this.position.z -= this.speed;
            rotateX(-this.angle);
        } else if (this.direction === "down" && this.position.z < world.depth - this.speed) {
            this.position.z += this.speed;
            rotateX(this.angle);
        } else {
            this.speed = this.speed * -1;
        }
    }
    gravity() {
        if(this.position.y + this.size > world.getCurrentY() + 10) {
            this.position.y -= 10;
        } else if(this.position.y + this.size < world.getCurrentY() - 10) {
            this.position.y += 10;
        } else {
            this.position.y = world.getCurrentY() - this.size;
        }
    }
    inertia() {
        if(this.speed < this.maxSpeed) {
            this.speed += 2;
        }
    }
}

class World {
    constructor() {
        this.size = 400;
        this.planeSize = 100;
        this.planes = [];
        this.width = 0;
        this.depth = 0;
    }
    init(size, planeSize) {
        this.size = size;
        this.planeSize = planeSize;

        for(let i = 0; i < Math.pow(this.size, 2) / this.planeSize; i++) {
            if(rayX < this.size) {
                this.planes.push(new Terrain(this.planeSize));
                this.planes[i].init(i);

                if(rayInvert) {
                    rayZ -= this.planes[i].depth;
                } else {
                    rayZ += this.planes[i].depth;
                }

                if(rayZ >= this.size - this.planeSize || rayZ < 0) {
                    rayInvert = !rayInvert;
                    rayX += this.planes[i].width;
                    if(rayInvert) {
                        rayZ -= this.planes[i].depth;
                    } else {
                        rayZ = 0;
                    }
                }
            }

            this.width = this.size;
            this.depth = this.size;
        }
    }
    draw() {
        for(let i = 0; i < this.planes.length; i++) {
            //this.planes[i].height
            this.planes[i].draw();

        }
    }
    getCurrentPlane(x, z) {
        return this.planes.filter(plane => {
           return plane.x + plane.width > x && plane.z + plane.depth > z && plane.x <= x && plane.z <= z;
        });
    }
    getCurrentY() {
        let plane = this.getCurrentPlane(player.position.x, player.position.z);
        if(plane[0] !== undefined) {
            return plane[0].y;
        } else {
            return -10000;
        }
    }
}

class Tree {
    constructor() {

    }
}

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

        this.x = rayX;
        this.z = rayZ;
        this.c = [200, 50 + 50 * index, 200];
    }
    draw() {
        push();
        rectMode(CORNER);
        angleMode(DEGREES);
        noStroke();

        ambientMaterial(this.c);
        translate(this.x, this.y, this.z);
        rotateX(this.slope);

        rect(0,0, this.width, this.depth);
        pop();
    }
}