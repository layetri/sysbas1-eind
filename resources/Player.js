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
        this.maxSpeed = 10;
        this.maxSpinSpd = 3;
        this.size = 20;
        this.renderDistance = fov / 2;
    }
    draw() {
        // Redraw the player orb
        push();
        rectMode(CORNER);
        translate(this.position.x, this.position.y, this.position.z);
        noStroke();
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

        // Calculate xSpeed and xPosition
        this.xSpeed = this.speed * Math.cos(xzAngle * Math.PI/180);
        this.position.x += this.xSpeed;

        // Calculate zSpeed and zPosition
        this.zSpeed = this.speed * Math.sin(xzAngle * Math.PI/180);
        this.position.z += this.zSpeed;

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
    }
    gravity() {
        if(this.position.y + this.size > world.getCurrentY()) {
            this.position.y -= 10;
        } else if(this.position.y + this.size < world.getCurrentY()) {
            this.position.y += 1;
        } else {
            this.position.y = world.getCurrentY() - this.size;
        }
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
}