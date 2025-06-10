import * as fnc from "./function";
import * as cls from "./class";
import * as mtx from "./matrice";

//
// MAIN
//

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

/**
 * - [Top-x, Top-y, Left-x, Left-y, Right-x, Right-y]
 * - JS uses 64bit Arrays, and CPU prefer 32bits for half numbers.
 * - Default values, but changed by shaders.
 */
const triangleVertices = new Float32Array([0, 1, -1, -1, 1, -1]);
const rgbTriangleColors = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255
]); // Colors
const gradientTriangleColors = new Uint8Array([
    229, 47, 15,
    246, 206, 29,
    233, 154, 26
]); // Colors

// Demo Main fnction.
async function main(): Promise<void> {

    // Canvas Element.
    const canvas = document.getElementById("webgl-canvas");
    if(!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error("Failed to get canvas element.");

    // Rendering Context.
    const gl = fnc.getContext(canvas);
    if(!gl) {
        const isWebGLSupported: boolean = !!(document.createElement('canvas')).getContext('webgl');
        if(isWebGLSupported) {
            throw new Error("WebGL2 is not supported - try using a different browser.");
        } else {
            throw new Error("WebGL is not supported - try using a different browser.");
        }
    }

    // Vertex Buffers.
    const triangleGeoBuffer = fnc.createStaticVertexBuffer(gl, triangleVertices);
    const rgbGeoBuffer = fnc.createStaticVertexBuffer(gl, rgbTriangleColors);
    const gradientGeoBuffer = fnc.createStaticVertexBuffer(gl, gradientTriangleColors);
    if(!triangleGeoBuffer || !rgbGeoBuffer || !gradientGeoBuffer) {
        fnc.showError("Failed to create vertex buffers.");
        return;
    }

    // Shaders source code in text format.
    const vertexShaderSource = await fnc.getShaderSource('shaders/vertex_shader.vert');
    const fragmentShaderSource = await fnc.getShaderSource('shaders/fragment_shader.frag');

    // Vertex Shader.
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if(vertexShader === null) return fnc.showError("No GPU Memory to allocate for Vertex Shader.");
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        fnc.showError(error || "No shader debug log provided.");
        return;
    }

    // Fragment Shader.
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if(fragmentShader === null) {
        fnc.showError("No GPU Memory to allocate for Fragment Shader.");
        return;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        fnc.showError(error || "No shader debug log provided.");
        return;
    }

    // Program set up for Uniforms.
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        fnc.showError(error || "No program debug log provided.");
        return;
    }

    // Get the built-in variables from shaders.
    const vertexPositionAttribute = gl.getAttribLocation(program, 'vertexPosition');
    const vertexColorAttribute = gl.getAttribLocation(program, 'vertexColor');
    if(vertexPositionAttribute < 0 || vertexColorAttribute < 0) {
        fnc.showError("Failed to get Attribute Location for vertexPosition.");
        return;
    }

    // Set the Uniforms variables.
    const locationUniform = gl.getUniformLocation(program, 'location');
    const sizeUniform = gl.getUniformLocation(program, 'size');
    const canvasSizeUniform = gl.getUniformLocation(program, 'canvasSize');
    if(locationUniform === null || sizeUniform === null || canvasSizeUniform === null) {
        fnc.showError(`Uniforms are empty:
            - locationUniform=${locationUniform}
            - sizeUniform=${sizeUniform}
            - canvasSizeUniform=${canvasSizeUniform}
            `);
        return;
    }

    // Create VAO Buffers.
    const rgbTriangleVAO = fnc.createTwoBufferVao(gl, triangleGeoBuffer, rgbGeoBuffer, vertexPositionAttribute, vertexColorAttribute);
    const gradientTriangleVAO = fnc.createTwoBufferVao(gl, triangleGeoBuffer, gradientGeoBuffer, vertexPositionAttribute, vertexColorAttribute);
    if(!rgbTriangleVAO || !gradientTriangleVAO) {
        fnc.showError(`Failes to create VAOs: 
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
    let shapes: cls.MovingShape[] = [];
    let timeToNextSpawn = SPAWN_RATE;
    let lastFrameTime = performance.now();

    /**
     * Add a fnction to call it each frame.
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

            const angle = fnc.getRandomInRange(0, 2 * Math.PI);
            const speed = fnc.getRandomInRange(SHAPE_SPEED.MIN, SHAPE_SPEED.MAX);
            const position: [number, number] = [canvas.width / 2, canvas.height / 2];
            const velocity: [number, number] = [
                Math.sin(angle) * speed,
                Math.cos(angle) * speed
            ];
            const size = fnc.getRandomInRange(SHAPE_SIZE.MIN, SHAPE_SIZE.MAX);
            const timeRemaining = fnc.getRandomInRange(SHAPE_TIME.MIN, SHAPE_TIME.MAX);
            const vao = (Math.random() < 0.5) ? rgbTriangleVAO : gradientTriangleVAO;
            const shape = new cls.MovingShape(position, velocity, size, timeRemaining, vao);
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
        gl.viewport(0, 0, canvas.width, canvas.height);
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

fnc.showError("No Errors! 🌞");

try { main(); } catch(e) { fnc.showError(`Uncaught exception: ${e}`); }