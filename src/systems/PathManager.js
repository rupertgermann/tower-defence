import Phaser from 'phaser';

export default class PathManager {
    constructor(scene) {
        this.scene = scene;
        this.path = [];
        this.pathGraphics = null;
    }

    /**
     * Set the path for enemies to follow
     * @param {Array} points - Array of {x, y} coordinates
     */
    setPath(points) {
        this.path = points;
        this.drawPath();
    }

    /**
     * Get the full path
     * @returns {Array} Array of path points
     */
    getPath() {
        return this.path;
    }

    /**
     * Get the starting point of the path
     * @returns {Object} {x, y} coordinates
     */
    getStartPoint() {
        return this.path[0];
    }

    /**
     * Get the end point of the path
     * @returns {Object} {x, y} coordinates
     */
    getEndPoint() {
        return this.path[this.path.length - 1];
    }

    /**
     * Draw the path for visualization during development
     * This can be disabled in production
     */
    drawPath() {
        // Clear any existing path graphics
        if (this.pathGraphics) {
            this.pathGraphics.clear();
        } else {
            this.pathGraphics = this.scene.add.graphics();
        }

        // Set line style
        this.pathGraphics.lineStyle(2, 0xffff00, 0.5);

        // Draw lines between path points
        for (let i = 0; i < this.path.length - 1; i++) {
            const startPoint = this.path[i];
            const endPoint = this.path[i + 1];

            this.pathGraphics.lineBetween(
                startPoint.x, startPoint.y,
                endPoint.x, endPoint.y
            );
        }

        // Draw circles at each path point
        this.pathGraphics.fillStyle(0xff0000, 0.5);
        for (const point of this.path) {
            this.pathGraphics.fillCircle(point.x, point.y, 5);
        }

        // Make start and end points more visible
        this.pathGraphics.fillStyle(0x00ff00, 0.8);
        this.pathGraphics.fillCircle(this.path[0].x, this.path[0].y, 8);
        
        this.pathGraphics.fillStyle(0x0000ff, 0.8);
        this.pathGraphics.fillCircle(
            this.path[this.path.length - 1].x,
            this.path[this.path.length - 1].y,
            8
        );
    }

    /**
     * Calculate the distance along the path
     * @param {number} index - Index of the current path segment
     * @param {number} t - Normalized position along the current segment (0-1)
     * @returns {number} Total distance along the path
     */
    getDistanceAlongPath(index, t) {
        let distance = 0;

        // Add up distances of completed segments
        for (let i = 0; i < index; i++) {
            distance += Phaser.Math.Distance.Between(
                this.path[i].x, this.path[i].y,
                this.path[i + 1].x, this.path[i + 1].y
            );
        }

        // Add partial distance along current segment
        if (index < this.path.length - 1) {
            const segmentLength = Phaser.Math.Distance.Between(
                this.path[index].x, this.path[index].y,
                this.path[index + 1].x, this.path[index + 1].y
            );
            distance += segmentLength * t;
        }

        return distance;
    }

    /**
     * Get the total length of the path
     * @returns {number} Total path length
     */
    getTotalPathLength() {
        let length = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            length += Phaser.Math.Distance.Between(
                this.path[i].x, this.path[i].y,
                this.path[i + 1].x, this.path[i + 1].y
            );
        }
        return length;
    }

    /**
     * Get position at a specific distance along the path
     * @param {number} distance - Distance along the path
     * @returns {Object} {x, y, angle} position and angle
     */
    getPositionAtDistance(distance) {
        let currentDistance = 0;
        let remainingDistance = distance;

        // Find the appropriate path segment
        for (let i = 0; i < this.path.length - 1; i++) {
            const segmentLength = Phaser.Math.Distance.Between(
                this.path[i].x, this.path[i].y,
                this.path[i + 1].x, this.path[i + 1].y
            );

            if (currentDistance + segmentLength >= distance) {
                // This is the segment we want
                const t = remainingDistance / segmentLength;
                
                // Calculate position
                const x = Phaser.Math.Linear(this.path[i].x, this.path[i + 1].x, t);
                const y = Phaser.Math.Linear(this.path[i].y, this.path[i + 1].y, t);
                
                // Calculate angle
                const angle = Phaser.Math.Angle.Between(
                    this.path[i].x, this.path[i].y,
                    this.path[i + 1].x, this.path[i + 1].y
                );
                
                return { x, y, angle };
            }

            currentDistance += segmentLength;
            remainingDistance -= segmentLength;
        }

        // If we've gone beyond the path, return the end point
        const lastPoint = this.path[this.path.length - 1];
        const secondLastPoint = this.path[this.path.length - 2];
        const angle = Phaser.Math.Angle.Between(
            secondLastPoint.x, secondLastPoint.y,
            lastPoint.x, lastPoint.y
        );
        
        return {
            x: lastPoint.x,
            y: lastPoint.y,
            angle: angle
        };
    }
}
