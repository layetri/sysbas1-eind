class Player {
    constructor(initPosition) {
        this.color = {r: 255, g: 255, b: 255};
        this.rotation = {x: 0, y: 0, z: 0};
        this.position = {
            x: initPosition / 2,
            y: world.getCurrentY(initPosition / 2, initPosition / 2),
            z: initPosition / 2
        };
        this.speed = 0;
        this.xSpeed = 0;
        this.zSpeed = 0;
        this.spinSpeed = 0;
        this.angle = 0;
        this.direction = "left";
        this.maxSpeed = 8;
        this.maxSpinSpd = 3;
        this.size = 20;
        this.renderDistance = fov / 2;

        this.selfControlled = false;
        this.powered = false;
    }
    draw() {
        // Redraw the player orb
        push();
        noStroke();
        translate(this.position.x, this.position.y, this.position.z);
        rectMode(CENTER);

        ambientMaterial(this.color.r, this.color.g, this.color.b);
        sphere(this.size);
        pop();
    }
    rotate() {
        if(this.speed > 0) {
            this.angle += this.speed * 10;
        }
    }
    move() {
        this.gravity();
        this.draw();
        this.collide();

        // Calculate xSpeed and xPosition
        this.xSpeed = this.speed * Math.cos(xzAngle * Math.PI/180);
        this.position.x += this.xSpeed;

        // OSC out: Player X position
        client.sendMessage('/player/x', this.position.x);

        // Calculate zSpeed and zPosition
        this.zSpeed = this.speed * Math.sin(xzAngle * Math.PI/180);
        this.position.z += this.zSpeed;

        // OSC out: Player Z position
        client.sendMessage('/player/z', this.position.z);

        calibrateViewer();

        let v = Math.floor((this.speed / this.maxSpeed) * 100);
        if(v < 0) {v = v * -1}
        $('#speedDisplay').html(v);
    }
    spin(direction) {
        if(direction === 'left') {
            xzAngle -= this.spinSpeed;

        } else {
            xzAngle += this.spinSpeed;
        }

        if(xzAngle < -180) {
            xzAngle = 180;
        } else if(xzAngle > 180) {
            xzAngle = -180;
        }

        $('#spinDisplay').html(xzAngle);

        // OSC out: Angle
        client.sendMessage('/angle', (xzAngle + 180));
    }
    gravity() {
        if(clock < length - 5) {
            if (!this.powered && this.position.y + (this.size / 2) > world.getCurrentY()) {
                this.speed = this.speed * -1;
            } else if (this.position.y + this.size > world.getCurrentY()) {
                this.position.y -= 10;
            } else if (this.position.y + this.size < world.getCurrentY()) {
                this.position.y += 1;
            } else {
                this.position.y = world.getCurrentY() - this.size;
            }
        } else {
            this.position.y += 10;
        }

        // OSC out: Player Y value
        client.sendMessage('/player/y', this.position.y);
    }
    inertia() {
        if(this.speed < this.maxSpeed && this.speed > this.maxSpeed * -1) {
            if(this.direction === 'up') {
                this.speed -= 2;
            } else if(this.direction === 'down') {
                this.speed += 2;
            }
        }
    }
    spinertia() {
        if(this.spinSpeed < this.maxSpinSpd) {
            this.spinSpeed += 0.5;
        }
    }
    collide() {
        if(!this.selfControlled) {
            let collisions = obstacles.filter(obs => {
                let dx = obs.x - this.position.x;
                let dz = obs.z - this.position.z;
                let safeZone = (obs.s / 2) + (this.size / 2);

                return dx < safeZone && dx > -1 * safeZone && dz < safeZone && dz > -1 * safeZone;
            });

            let spd = this.speed;
            if (spd < 0) {
                spd = spd * -1
            }

            // If a collision occurs at high speed, take over control of the Player orb and bounce off the obstacle.
            if (collisions.length > 0 && spd > this.maxSpeed * 0.6 && this.powered) {
                this.bounceOff(spd, collisions);
            } else if(collisions.length > 0) {
                this.speed = this.speed * -1;
            }
        }
    }
    bounceOff(spd, collisions) {
        this.selfControlled = true;
        noLoop();
        client.sendMessage('/bouncing', 1);

        let bounceTime = (spd / this.maxSpeed) * 6000;
        let bouncedTime = 0;
        let offset = this.position.y;
        let base = 0.5 * (Math.pow((0 - (bounceTime / 2)), 2) / 50000);

        console.log({total: bounceTime, spd: spd, max: this.maxSpeed})

        this.speed = this.maxSpeed;


        let interval = setInterval(() => {
            if(bouncedTime < bounceTime) {
                let h = calcBounce(bouncedTime, bounceTime, offset) - base;
                this.position.y = offset + h;

                console.log({ypos: this.position.y, time: bouncedTime, off: offset});

                redraw();
                bouncedTime += 300;
            } else {
                clearInterval(interval);
                this.selfControlled = false;
                this.position.y = Math.round(this.position.y);
                client.sendMessage('/bouncing', 0);
                loop();
            }
        }, 200);
    }
}

function calcBounce(t, total, offset) {
    return 0.5 * (Math.pow(((t + 300) - (total / 2)), 2) / 50000);
}

function testBounce() {
    player.selfControlled = true;
    player.speed = player.maxSpeed;
    player.bounceOff();
}