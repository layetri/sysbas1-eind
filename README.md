# r0LL (Final Project, SYSBAS1B)

### Introduction
This repository contains the files to @elmermakkinga and @layetri's final project for the Music & Technology SYSBAS course at HKU University of the Arts Utrecht, the Netherlands. The result is a game called "r0LL", written in P5.js, with a sound generation engine written in MaxMSP. Try it live at [layetri's website](https://mt.layetri.nl/projects/roll).

### Contents
- [Installation](#installation)
- [Classes](#classes)
- [OSC Routes](#osc-routes)

## Installation
To get started, make sure you have `nodejs` and `npm` installed. This project depends on `express`, which is already included in `package.json`.
To install, browse to the project root directory and run `npm install`. NPM will now install the project dependencies. After this, you can use `npm start` to start the server at `your_local_ip:8001`.

## Classes
### `Player` class
The `Player` class renders the Player, which is a user controlled orb interacting with the `World` and `Obstacle` classes.

#### Methods
- `draw()` draws the player orb on the screen as a sphere at the current `player.position` with size `player.size`.
- `move()` is an umbrella function that calls `player.gravity()`, `player.draw()`, `player.collide()` and the global `calibrateViewer()`. It calculates the individual `player.xSpeed` and `player.zSpeed` from the total `player.speed` and adjusts the `player.position` accordingly. It also updates the UI's speed display.
- `spin()` calculates the global `xzAngle` rotation based on user input. The `xzAngle` dictates both the distribution of `player.speed` over the X and Z axises, as well as the camera rotation. It updates the UI's angle display.
- `gravity()` adjusts `player.position.y` according to the `World`'s `getCurrentY()` method.
- `inertia()` increments the `player.speed` while it isn't greater than `player.maxSpeed` according to the user input (`ARROW_DOWN` increases the speed, `ARROW_UP` decreases the speed until it reaches `player.maxSpeed * -1`).
- `spinertia()` (UNTESTED) increases the `player.spinSpeed` while the left or right arrow key is pressed. This gives an inertia effect to the rotation movement.
- `collide()` detects collisions with any `Obstacle` class objects in the `World`. If any collisions occur at a `player.speed` greater than 60% of its `maxSpeed`, it locks the `player`'s controls by activating the `player.selfControlled` flag and triggers the `player.bounceOff()` method.
- `bounceOff()` freezes the rendering process and bounces the `player` by moving its `position.y` along a parabola calculated based on the `player.speed` at inverted speed on the X and Z axises. It single-frames the rendering process at a 200ms interval, until the animation length reaches the animation duration time calculated based on a `speed / maxSpeed` fraction of 6000ms. Once the bounce animation is complete, it resumes the rendering process and hands back control to the user.

#### Usage
First, in the `setup()` of `sketch.js`, a new `Player()` is created with the `fov` variable as its only argument. It is then rendered after the `World` and `Obstacle` classes, since the `Player` depends on values provided by these classes to function. The `handleKeys()` function is first called to guide user input to the right places, after which `player.move()` and `player.rotate()` are called. After that, a check is ran that provides control locking for the ending animation by setting the `player.selfControlled` flag to true if the remaining time is less than 5 seconds.

### `Obstacle` class

#### Methods
#### Usage

### `Terrain` class

#### Methods
#### Usage

### `World` class

#### Methods
#### Usage

## OSC Routes
### `/started`
Boolean that indicates that the game has been started and hasn't ended yet. This message is sent once when the startBtn is clicked (a `1` value), and once more when the timer ends (a `0` value).

### `/player`
Collection that has three sub-addresses for the current `x`, `y` and `z` position of the `player` class. All three are integers that are updated at the refresh rate of the client.

### `/player/angle`
Float that indicates the amount of degrees that the `player` class is rotated horizontally. The starting position is `0` and it has a range of `[-180, 180]`.

### `/player/speed`
Float that indicates the current total speed of the `player` class.

### `/player/xSpeed` & `/player/zSpeed`
Floats that indicate the current speed of the `player` class on both horizontal axises. These are a fraction of the total speed.

### `/plane/removed` & `plane/added`
Event emitted when planes are removed or added to the world.

### `/bouncing`
Boolean that indicates when a `player.bounceOff()` event happens. It emits a `1` value while the player orb bounces, and results to `0` otherwise.

### `/night`
Boolean that indicates when `nightMode` is triggered. This message is emitted once when the game scene turns to night. The value is always a `1`. It won't be emitted when `nightMode` is inactive.

### `/clock`
Integer that holds the current `clock` value in seconds. This message is sent with every `clock` update cycle.

### `/endOfTime`
Boolean that is triggered once when the End Of Time is reached (5 seconds before the game length). It holds a value of `1`.