class Obstacle {
    constructor() {
        this.x = random(player.size, world.width - player.size);
        this.z = random(player.size, world.depth - player.size);
        this.y = world.getCurrentY(this.x, this.z);
        this.c = [random(0, 255), random(0,255), random(0,255)];
        this.s = random(20, 50);
    }
    draw() {
        push();
        translate(this.x, this.y, this.z);
        fill(this.c);
        box(this.s);
        pop();
    }
}