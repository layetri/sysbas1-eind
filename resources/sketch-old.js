let player;
let terrain;
let viewer;
let world;
let rayX = 0;
let rayZ = 0;
let rayInvert = false;
let xzAngle = 0;

function setup() {
    // Initialize the canvas at screen size
    createCanvas(windowWidth, (windowHeight - 100), WEBGL);

    // Create the World
    world = new World();

    // Initialize the World
    world.init(800, 50);

    // Create the Player
    player = new Player();

    // Create a camera, the Viewer
    viewer = createCamera();
    calibrateViewer();
    viewer.tilt(40);
}

function draw() {
    // Draw the background
    background(100);

    // Allow for camera control by mouse
    orbitControl();

    // Light it up!
    ambientLight(100);
    pointLight(250, 250, 250, width - 40, 40, 1);

    // Draw the world
    world.draw();

    // Detect key changes (TBR)
    if(keyIsDown(LEFT_ARROW)) {
        player.spin('left');
        xzAngle -= 0.5;
    }
    if(keyIsDown(RIGHT_ARROW)) {
        player.spin('right');
        xzAngle += 0.5;
    }
    if(keyIsDown(UP_ARROW)) {
        player.inertia();
    }
    if(keyIsDown(DOWN_ARROW)) {
        player.inertia();
    }

    if(!keyIsPressed) {
        if(player.speed > 0) {
            player.speed -= 0.5;
        } else if(player.speed < 0) {
            player.speed += 0.5;
        }
    }

    // Move the player orb
    player.move();
    // Rotate the player orb
    player.rotate();
    // Draw the player orb
    player.draw();
}

// Functions n all, yay
function calibrateViewer() {
    // Function that calibrates the Viewer to always have the Player centered.
    let focus = player.position;
    viewer.lookAt(focus.x, focus.y, focus.z);
    viewer.setPosition(focus.x +300, focus.y -200, focus.z +300);
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
        // Draw the player orb
        //rectMode(CENTER);
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

        // TBA: individual axis movement

        // Movement prototype/placeholder
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

        calibrateViewer();

        $('#speedDisplay').html(Math.floor((this.speed / this.maxSpeed) * 100));
    }
    spin(direction) {
        if(direction === 'left') {
            xzAngle -= 5;
            viewer.pan(-5);
        } else {
            xzAngle += 5;
            viewer.pan(5);
        }

        if(xzAngle < 0) {
            xzAngle = 360;
        } else if(xzAngle > 360) {
            xzAngle = 0;
        }

        $('#spinDisplay').html(xzAngle);
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

    // TBA: individual axis inertia
    inertiaX() {
        if(this.speed < this.maxSpeed) {
            this.speed += 2;
        }
    }
    inertiaY() {
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
            // Iterates over the width of the world (X axis) for each depth of the world (Z axis)
            if(rayX < this.size) {
                // Create a new plane
                this.planes.push(new Terrain(this.planeSize));
                // Initialize the plane
                this.planes[i].init(i);

                // Recalculate the current Z axis position
                if(rayInvert) {
                    rayZ -= this.planes[i].depth;
                } else {
                    rayZ += this.planes[i].depth;
                }

                // If the Z axis position is equal to the max size, invert the rendering process direction
                if(rayZ >= this.size - this.planeSize || rayZ < 0) {
                    rayInvert = !rayInvert;
                    rayX += this.planes[i].width;

                    // Prepare for the next Z axis ray
                    if(rayInvert) {
                        rayZ -= this.planes[i].depth;
                    } else {
                        rayZ = 0;
                    }
                }
            }

            // Calculate the width and depth properties (for easy reading)
            this.width = this.size;
            this.depth = this.size;
        }
    }
    draw() {
        // Draw every plane in the world
        for(let i = 0; i < this.planes.length; i++) {
            this.planes[i].draw();
        }
    }
    getCurrentPlane(x, z) {
        // Filters the planes array with the current location of the player
        return this.planes.filter(plane => {
           return plane.x + plane.width > x && plane.z + plane.depth > z && plane.x <= x && plane.z <= z;
        });
    }
    getCurrentY() {
        // Get the current location of the player
        let plane = this.getCurrentPlane(player.position.x, player.position.z);

        // If the player is on a plane, return its Y value
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