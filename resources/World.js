class World {
    constructor() {
        this.size = 400;
        this.planeSize = 100;
        this.planes = [];
        this.width = 0;
        this.depth = 0;
        this.xStart = 0;
        this.xEnd = 0;
        this.zStart = 0;
        this.zEnd = 0;
    }
    init(size, planeSize) {
        this.size = size;
        this.planeSize = planeSize;
        this.zEnd = this.size;
        this.xEnd = this.size;

        this.fillArea([0, size], [0, size]);

        // Calculate the width and depth properties (for easy reading)
        this.width = this.size;
        this.depth = this.size;

    }
    draw() {
        // Determine the necessary world size
        this.applyFOV();

        // Draw every plane in the world
        for(let i = 0; i < this.planes.length; i++) {
            this.planes[i].draw();
        }
    }
    fillArea(xBounds, zBounds) {
        // This function fills a given area of the world with planes by iterating over its width and depth.
        rayX = xBounds[0];
        rayZ = zBounds[0];
        rayInvert = false;

        // Calculate the delta for X and Z axis bounds
        let xBound = xBounds[1] - xBounds[0];
        let zBound = zBounds[1] - zBounds[0];

        let prelen = this.planes.length;

        for(let i = 0; i < Math.ceil( (zBound * xBound) / Math.pow(this.planeSize, 2)); i++) {
            // Iterates over the width of the world (X axis) for each depth of the world (Z axis)
            if(rayX < xBounds[1]) {
                let ind = prelen + i;
                // Create a new plane
                this.planes.push(new Terrain(this.planeSize));
                // Initialize the plane
                this.planes[ind].init(ind);

                // Recalculate the current Z axis position
                if(rayInvert) {
                    rayZ -= this.planes[ind].depth;
                } else {
                    rayZ += this.planes[ind].depth;
                }

                // If the Z axis position is equal to the max size, invert the rendering process direction
                if(rayZ >= zBounds[1] || rayZ < zBounds[0]) {
                    rayInvert = !rayInvert;
                    rayX += this.planes[ind].width;

                    // Prepare for the next Z axis ray
                    if(rayInvert) {
                        rayZ -= this.planes[ind].depth;
                    } else {
                        rayZ = zBounds[0];
                    }
                }
            }
        }
    }
    applyFOV() {
        // This function applies a Field Of View around the Player instance, rendering only the world within these boundaries to save resources.

        // Positioning
        let zStart = player.position.z - player.renderDistance;
        let zEnd = player.position.z + player.renderDistance;
        let xStart = player.position.x - player.renderDistance;
        let xEnd = player.position.x + player.renderDistance;

        // Bools for OSC output
        let added = false;
        let removed = false;

        // Calculate world end on Z axis
        if(this.zEnd < zEnd) {
            //create extra planes
            let z1 = this.zEnd;
            let z2 = (Math.ceil((zEnd - this.zEnd) / this.planeSize) * this.planeSize) + this.zEnd;

            let zBounds = [z1, z2];
            let xBounds = [this.xStart, this.xEnd];

            this.fillArea(xBounds, zBounds);
            this.zEnd = z2;

            added = true;
        } else if(this.zEnd > zEnd + this.planeSize) {
            //remove unnecessary planes
            let res = world.planes.filter(plane => {
                return plane.z > zEnd;
            });

            for(let i = 0; i < res.length; i++) {
                let ind = world.planes.indexOf(res[i]);
                world.planes.splice(ind, 1);
            }

            this.zEnd = this.zEnd - (Math.floor((this.zEnd - zEnd) / this.planeSize) * this.planeSize);

            removed = true;
        }

        // Calculate world start on Z axis
        let fullPlanes = Math.floor(zStart / this.planeSize) * this.planeSize;
        if(this.zStart > fullPlanes) {
            //create extra planes
            let z1 = (Math.floor((zStart - this.zStart) / this.planeSize) * this.planeSize) + this.zStart;
            let z2 = this.zStart;

            let zBounds = [z1, z2];
            let xBounds = [this.xStart, this.xEnd];

            this.fillArea(xBounds, zBounds);

            this.zStart = z1;
        } else if(this.zStart < fullPlanes) {
            //remove unnecessary planes
            let res = world.planes.filter(plane => {
                return plane.z < fullPlanes;
            });

            for(let i = 0; i < res.length; i++) {
                let ind = world.planes.indexOf(res[i]);
                world.planes.splice(ind, 1);
            }

            this.zStart = this.zStart + (Math.floor((zStart - this.zStart) / this.planeSize) * this.planeSize);

            removed = true;
        }

        // Calculate world end on X axis
        if(this.xEnd < xEnd) {
            //create extra planes
            let x1 = this.xEnd;
            let x2 = (Math.ceil((xEnd - this.xEnd) / this.planeSize) * this.planeSize) + this.xEnd;

            let zBounds = [this.zStart, this.zEnd];
            let xBounds = [x1, x2];

            this.fillArea(xBounds, zBounds);
            this.xEnd = x2;

            added = true;
        } else if(this.xEnd > xEnd + this.planeSize) {
            //remove unnecessary planes
            let res = world.planes.filter(plane => {
                return plane.x > xEnd;
            });

            for(let i = 0; i < res.length; i++) {
                let ind = world.planes.indexOf(res[i]);
                world.planes.splice(ind, 1);
            }

            this.xEnd = this.xEnd - (Math.floor((this.xEnd - xEnd) / this.planeSize) * this.planeSize);

            removed = true;
        }

        // Calculate world start on Z axis
        let fullPlanesX = Math.floor(xStart / this.planeSize) * this.planeSize;
        if(this.xStart > fullPlanesX) {
            //create extra planes
            let x1 = (Math.floor((xStart - this.xStart) / this.planeSize) * this.planeSize) + this.xStart;
            let x2 = this.xStart;

            let zBounds = [this.zStart, this.zEnd];
            let xBounds = [x1, x2];

            this.fillArea(xBounds, zBounds);

            this.xStart = x1;
        } else if(this.xStart < fullPlanesX) {
            //remove unnecessary planes
            let res = world.planes.filter(plane => {
                return plane.x < fullPlanesX;
            });

            for(let i = 0; i < res.length; i++) {
                let ind = world.planes.indexOf(res[i]);
                world.planes.splice(ind, 1);
            }

            this.xStart = this.xStart + (Math.floor((xStart - this.xStart) / this.planeSize) * this.planeSize);

            removed = true;
        }

        if(removed) {
            // fire OSC event "removed"
        }
        if(added) {
            // fire OSC event "added"
        }
    }
    getCurrentPlane(x, z) {
        // Filters the planes array with the current location of the player
        return this.planes.filter(plane => {
            return plane.x + plane.width > x && plane.z + plane.depth > z && plane.x <= x && plane.z <= z;
        });
    }
    getCurrentY(x, z) {
        let plane;
        if(x && z) {
            // Get the Y value for X and Z arguments
            plane = this.getCurrentPlane(x, z);
        } else {
            // Get the current Y value of the player
            plane = this.getCurrentPlane(player.position.x, player.position.z);
        }

        // If the player is on a plane, return its Y value
        if(plane[0] !== undefined) {
            return plane[0].y;
        } else {
            return 0;
        }
    }
}