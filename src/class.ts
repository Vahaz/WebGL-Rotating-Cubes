//
// CLASS
//

/**
 * - Create a Class "MovingShape" with a position, velocity, size and vao arguments.
 * - The class as a method "update" with dt (delta time) argument.
 * - "Update" update the position by adding: position = ((position + velocity) * dt)
 * - Position is expressed in pixels and Velocity by pixels per seconds.
 */
export class MovingShape {
    constructor(
        public position: [number, number],
        public velocity: [number, number],
        public size: number,
        public timeRemaining: number,
        public vao: WebGLVertexArrayObject) {}
    isAlive() {
        return this.timeRemaining > 0;
    }
    update(dt: number) {
        this.position[0] += this.velocity[0] * dt;
        this.position[1] += this.velocity[1] * dt;
        this.timeRemaining -= dt;
    }
}

export class Shape {
    
}