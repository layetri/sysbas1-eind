let player, viewer, world;
let obstacles = [];
let obstacleNum = 4;

let rayX = 0;
let rayZ = 0;
let fov = 1600;

let rayInvert = false;
let xzAngle = 0;

let clock = 0;
let length = 120;
let interval;
let started = false;
let ended = false;

let bg = [168, 241, 255];
let bgw = [168, 241, 255];
let bgw_dir = ['up', 'up', 'up'];
let lamp = [120, 120, 90];

let nightMode = false;

// DOM functions
$(document).on('click', '#startBtn', function() {
   started = true;
   length = $('#len_box').val();
   interval = setInterval(function() {
       if(clock < length) {
           clock++;
           $('#clock').html(Math.floor(clock / 60)+':'+('0'+(clock % 60)).slice(-2));
       } else {
           clearInterval(interval);
       }
   }, 1000);
});

$(document).on('click', '#haltBtn', function() {
   noLoop();
});

// P5 functions
function setup() {
    // Initialize the canvas at screen size
    createCanvas(windowWidth, (windowHeight - 100), WEBGL);
    angleMode(DEGREES);

    // Create a background for the splash screen
    background(bgw);

    // debugging yay
    // debugMode();
    // frameRate(15);

    // Create the World
    world = new World();

    // Initialize the World
    world.init(fov, 200);

    // Create the Player
    player = new Player(fov);

    // Create the Obstacles
    for(let i = 0; i < obstacleNum; i++) {
        obstacles.push(new Obstacle);
    }

    // Create a camera, the Viewer
    viewer = createCamera();
    calibrateViewer();
    viewer.tilt(40);
}

function draw() {
    if(started && clock < length) {
        // Draw the background
        if(nightMode) {
            if(bg[0] > 1) {
                bg[0] -= 2;
            }
            if(bg[1] > 36) {
                bg[1] -= 2
            }
            if(bg[2] > 92) {
                bg[2] -= 2
            }
            if(lamp[0] < 207) {
                lamp[0] += 2;
            }
            if(lamp[1] < 139) {
                lamp[1] += 2
            }
            if(lamp[2] < 193) {
                lamp[2] += 2
            }
        }

        // Color the background dynamically
        background(bg);

        // Light it up!
        ambientLight(120, 120, 80);

        // Calculate sun position
        let lampX = (0.999 * player.position.x) - 40;
        let lampZ = (0.999 * player.position.z) + 40;
        pointLight(lamp, lampX, -1000, lampZ);

        // Draw the world
        world.draw();

        // Draw the obstacles on the world
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].draw();
        }

        // Transition to night at halftime
        if(clock === Math.floor(length / 2) && !nightMode) {
            nightMode = true;
        }

        // Detect key changes
        handleKeys();

        // Move the player orb
        player.move();
        // Rotate the player orb
        player.rotate();
    } else {
        for(let i = 0; i < bgw.length; i++) {
            let amt = Math.floor(random(0, 2));

            if(bgw_dir[i] === 'down') {
                bgw[i] -= amt;
                if(bgw[i] <= 180) {
                    bgw_dir[i] = 'up';
                }
            } else if(bgw_dir[i] === 'up') {
                bgw[i] += amt;
                if(bgw[i] > 240) {
                    bgw_dir[i] = 'down';
                }
            }
        }
        background(bgw);
    }
}

// Functions n all, yay
function calibrateViewer() {
    // Function that calibrates the Viewer to always have the Player centered.
    let focus = player.position;

    // calculate position around radius
    let z = 300 * Math.sin(xzAngle * Math.PI/180);
    let x = 300 * Math.cos(xzAngle * Math.PI/180);

    viewer.setPosition(focus.x + x, focus.y -200, focus.z + z);
    viewer.lookAt(focus.x, focus.y, focus.z);
}
function handleKeys() {
    if (keyIsDown(LEFT_ARROW)) {
        player.spin('left');
        player.spinertia();
    }
    if (keyIsDown(RIGHT_ARROW)) {
        player.spin('right');
        player.spinertia();
    }
    if (keyIsDown(UP_ARROW)) {
        player.direction = 'up';
        player.inertia();
    }
    if (keyIsDown(DOWN_ARROW)) {
        player.direction = 'down';
        player.inertia();
    }

    if (!keyIsPressed) {
        if (player.speed > 0) {
            player.speed = player.speed * Math.pow(0.99, player.speed + 0.5);
            if (player.speed < 0.1) {
                player.speed = 0;
            }
        } else if (player.speed < 0) {
            player.speed = player.speed * Math.pow(0.99, -1 * (player.speed) + 0.5);
            if (player.speed > -0.1) {
                player.speed = 0;
            }
        }
        if (player.spinSpeed > 0) {
            player.spinSpeed -= 0.5;
        } else if (player.spinSpeed < 0) {
            player.spinSpeed += 0.5;
        }
    }
}