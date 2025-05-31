/**
 * - Demo configuration constants
 * Default:
 * - SPAWN_RATE = 0.08
 * - SHAPE_TIME = {MIN: 0.25, MAX: 6}
 * - SHAPE_SPEED = {MIN: 125, MAX: 350}
 * - SHAPE_SIZE = {MIN: 2, MAX: 50}
 * - SHAPE_COUNT_MAX = 250
 */
const SPAWN_RATE = 0.08;
const SHAPE_TIME = {MIN: 0.25, MAX: 6};
const SHAPE_SPEED = {MIN: 125, MAX: 350};
const SHAPE_SIZE = {MIN: 2, MAX: 50};
const SHAPE_COUNT_MAX = 250;

// Display an error message to the HTML Element with id "error-container".
function showError(msg: string): void {
    const container = document.getElementById("error-container");
    if(container === null) return console.log("No Element with ID: error-container");
    const element = document.createElement('p');
    element.innerText = msg;
    container.appendChild(element);
    console.log(msg);
}

/**
 * - Create a WebGL Buffer type. (Opaque Handle)
 *   - STATIC_DRAW means we wont update often, but often used.
 *   - ARRAY_BUFFER on the other side indicate the place to store the Array.
 * - First, we attach the Buffer to the CPU.
 * - Add Array to the Buffer.
 * - Clear after use and return the buffer.
 */
function createStaticVertexBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer): WebGLBuffer {
    const buffer = gl.createBuffer();
    if(!buffer) { 
        showError("Failed to allocate buffer space"); 
        return 0; 
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buffer
}

/**
 * Input assembler → Read Vertices from GPU Buffer.
 * - Tell OpenGL the data type sent (Float, Array, etc)
 *   - Vertex Shader → Place Vertices in clip space.
 *   - Fragment Shader → Color the pixels.
 *   - If Vertex shader and Fragment shader are not present: OpenGL uses default 0 everywhere.
 * - VertexAttribPointer
 *   - Index (location)
 *   - Size (Component per vector)
 *   - Type
 *   - IsNormalized (int to floats, for color transform [0, 255] to float [0, 1])
 *   - Stride (Distance between each vertex in the buffer)
 *   - Offset (Number of skiped bytes before reading attributes)
 */
function createTwoBufferVao(
    gl: WebGL2RenderingContext,
    positionBuffer: WebGLBuffer, colorBuffer: WebGLBuffer,
    positionAttribute: number, colorAttribute: number
): WebGLVertexArrayObject {
    const vao = gl.createVertexArray();
    if(!vao) { showError("Failed to allocate VAO buffer."); return 0; }
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttribute);
    gl.enableVertexAttribArray(colorAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribute, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return vao;
}

// Return the WebGL Context from the Canvas Element.
function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
    return canvas.getContext('webgl2');
}

// Get a random number between two numbers.
function getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * - [Top-x, Top-y, Left-x, Left-y, Right-x, Right-y]
 * - JS uses 64bit Arrays, and CPU prefer 32bits for half numbers.
 * - "Default" values, but changed by shaders.
 */
const triangleVertices = new Float32Array([0, 1, -1, -1, 1, -1]);

/** Colors! */
const rgbTriangleColors = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255
]);

/** Colors! */
const gradientTriangleColors = new Uint8Array([
    229, 47, 15,
    246, 206, 29,
    233, 154, 26
]);

/**
 * Shader code, need to be placed here to be compiled and used by the GPU.
 * - " `#version 300 es " : in this order is mandatory!
 * - gl_Position = vec4(x, y, z-sorting [-1;1], w) [built-in]
 *   - x, y and z are devided by w.
 * - Take the canvasSize to devide the finalPosition.
 *   - The finalPosition: vertexPosition * size + location.
 * - to make sure they are in range, we / the finalPos by the canvasSizes
 * - ClipPosition is a %, so we need to make it in range from -1 to 1 by adding (*2 - 1)
 * - We input a color to the fragment color to pass the color along the shaders.
 */
const vertexShaderCode = `#version 300 es
precision mediump float;

in vec2 vertexPosition;
in vec3 vertexColor;

out vec3 fragmentColor;

uniform vec2 canvasSize;
uniform vec2 location;
uniform float size;

void main() {
    fragmentColor = vertexColor;
    vec2 finalPosition = vertexPosition * size + location;
    vec2 clipPosition = (finalPosition / canvasSize) * 2.0 - 1.0;
    gl_Position = vec4(clipPosition, 0.0, 1.0);
}
`;

/**
 * We need to specify here the variables, no built-in inputs.
 * We get the fragmentColor from the vertexShader
 */
const fragmentShaderCode = `#version 300 es
precision mediump float;

in vec3 fragmentColor;
out vec4 outputColor;

void main() {
    outputColor = vec4(fragmentColor, 1.0);
}
`;

/**
 * - Create a Class "MovingShape" with a position, velocity, size and vao arguments.
 * - The class as a method "update" with dt (delta time) argument.
 * - "Update" update the position by adding: position = ((position + velocity) * dt)
 * - Position is expressed in pixels and Velocity by pixels per seconds.
 */
class MovingShape {
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

// Demo Main function.
function main(): void {

    // Canvas Element.
    const canvas = document.getElementById("webgl-canvas");
    if(!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("Failed to get canvas element.");
    
    // Rendering Context.
    const gl = getContext(canvas);
    if(!gl) {
        const isWebGLSupported: boolean = !!(document.createElement('canvas')).getContext('webgl');
        if(isWebGLSupported) {
            throw new Error("WebGL2 is not supported - try using a different browser.");
        } else {
            throw new Error("WebGL is not supported - try using a different browser.");
        }
    }

    // Vertex Buffers.
    const triangleGeoBuffer = createStaticVertexBuffer(gl, triangleVertices);
    const rgbGeoBuffer = createStaticVertexBuffer(gl, rgbTriangleColors);
    const gradientGeoBuffer = createStaticVertexBuffer(gl, gradientTriangleColors);
    if(!triangleGeoBuffer || !rgbGeoBuffer || !gradientGeoBuffer) {
        showError("Failed to create vertex buffers.");
        return;
    }

    // Vertex Shader.
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if(vertexShader === null) return showError("No GPU Memory to allocate for Vertex Shader.");
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        showError(error || "No shader debug log provided.");
        return;
    }

    // Fragment Shader.
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if(fragmentShader === null) {
        showError("No GPU Memory to allocate for Fragment Shader.");
        return;
    }
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        showError(error || "No shader debug log provided.");
        return;
    }

    // Program set up for Uniforms.
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        showError(error || "No program debug log provided.");
        return;
    }

    // Get the built-in variables from shaders.
    const vertexPositionAttribute = gl.getAttribLocation(program, 'vertexPosition');
    const vertexColorAttribute = gl.getAttribLocation(program, 'vertexColor');
    if(vertexPositionAttribute < 0 || vertexColorAttribute < 0) {
        showError("Failed to get Attribute Location for vertexPosition.");
        return;
    }

    // Set the Uniforms variables.
    const locationUniform = gl.getUniformLocation(program, 'location');
    const sizeUniform = gl.getUniformLocation(program, 'size');
    const canvasSizeUniform = gl.getUniformLocation(program, 'canvasSize');
    if(locationUniform === null || sizeUniform === null || canvasSizeUniform === null) {
        showError(`Uniforms are empty:
            - locationUniform=${locationUniform}
            - sizeUniform=${sizeUniform}
            - canvasSizeUniform=${canvasSizeUniform}
            `);
        return;
    }

    // Create VAO Buffers.
    const rgbTriangleVAO = createTwoBufferVao(gl, triangleGeoBuffer, rgbGeoBuffer, vertexPositionAttribute, vertexColorAttribute);
    const gradientTriangleVAO = createTwoBufferVao(gl, triangleGeoBuffer, gradientGeoBuffer, vertexPositionAttribute, vertexColorAttribute);
    if(!rgbTriangleVAO || !gradientTriangleVAO) {
        showError(`Failes to create VAOs: 
            - rgbTriangle=${!!rgbTriangleVAO}
            - gradientTriangle=${!!gradientTriangleVAO}
            `);
        return;
    }

    /**
     * - Create an empty array to store our shapes.
     * - Set up time to the next shape spawn on the SPAWN_RATE
     * - Adding Time between last frame / now as "lastFrameTime"
     */
    let shapes: MovingShape[] = [];
    let timeToNextSpawn = SPAWN_RATE;
    let lastFrameTime = performance.now();

    /**
     * Add a function to call it each frame.
     * - Output Merger: Merge the shaded pixel fragment with the existing out image.
     * - Rasterizer: Wich pixel are part of the Vertices + Wich part is modified by OpenGL.
     * - GPU Program: Pair Vertex & Fragment shaders.
     * - Uniforms: Setting them (can be set anywhere) (size/loc in pixels (px))
     * - Draw Calls: (w/ Primitive assembly + for loop)
     */
    const frame = function(){

        // Calculate dt with time in seconds between each frame.
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;

        /**
         * - Updating timeToNextSpawn = timeToNextSpawn - dt;
         * - While timeToNextSpawn is at 0, add SPAWN_RATE to itself.
         */
        timeToNextSpawn -= dt;
        while (timeToNextSpawn < 0) {
            timeToNextSpawn += SPAWN_RATE;

            const angle = getRandomInRange(0, 2 * Math.PI);
            const speed = getRandomInRange(SHAPE_SPEED.MIN, SHAPE_SPEED.MAX);
            const position: [number, number] = [canvas.width / 2, canvas.height / 2];
            const velocity: [number, number] = [
                Math.sin(angle) * speed,
                Math.cos(angle) * speed
            ]
            const size = getRandomInRange(SHAPE_SIZE.MIN, SHAPE_SIZE.MAX);
            const timeRemaining = getRandomInRange(SHAPE_TIME.MIN, SHAPE_TIME.MAX);
            const vao = (Math.random() < 0.5) ? rgbTriangleVAO : gradientTriangleVAO;
            const shape = new MovingShape(position, velocity, size, timeRemaining, vao);
            shapes.push(shape);
        }

        // Update Shapes.
        shapes.forEach((shape) => {
            shape.update(dt);
        });

        shapes = shapes.filter((shape) => shape.isAlive()).slice(0, SHAPE_COUNT_MAX);

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.clearColor(0.08, 0.08, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.useProgram(program);
        gl.uniform2f(canvasSizeUniform, canvas.width, canvas.height);

        shapes.forEach((shape) => {
            gl.uniform1f(sizeUniform, shape.size);
            gl.uniform2f(locationUniform, shape.position[0], shape.position[1]);
            gl.bindVertexArray(shape.vao);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        });

        // Loop calls, each time the drawing is ready.
        requestAnimationFrame(frame);
    };

    // First call, as soon, as the browser is ready.
    requestAnimationFrame(frame);
    
}

showError("No Errors! 🌞")

try { main(); } catch(e) { showError(`Uncaught exception: ${e}`); }