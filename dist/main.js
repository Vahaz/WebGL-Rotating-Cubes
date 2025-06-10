/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ (function() {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const SHAPE_TIME = { MIN: 0.25, MAX: 6 };
const SHAPE_SPEED = { MIN: 125, MAX: 350 };
const SHAPE_SIZE = { MIN: 2, MAX: 50 };
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
// Display an error message to the HTML Element with id "error-container".
function showError(msg) {
    const container = document.getElementById("error-container");
    if (container === null)
        return console.log("No Element with ID: error-container");
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
function createStaticVertexBuffer(gl, data) {
    const buffer = gl.createBuffer();
    if (!buffer) {
        showError("Failed to allocate buffer space");
        return 0;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buffer;
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
function createTwoBufferVao(gl, positionBuffer, colorBuffer, positionAttribute, colorAttribute) {
    const vao = gl.createVertexArray();
    if (!vao) {
        showError("Failed to allocate VAO buffer.");
        return 0;
    }
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
function getContext(canvas) {
    return canvas.getContext('webgl2');
}
// Get a random number between two numbers.
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}
// Get shaders source code.
function getShaderSource(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        if (!response.ok) {
            throw new Error(`Error while loading shader code at "${url}": ${response.statusText}`);
        }
        return response.text();
    });
}
/**
 * - Create a Class "MovingShape" with a position, velocity, size and vao arguments.
 * - The class as a method "update" with dt (delta time) argument.
 * - "Update" update the position by adding: position = ((position + velocity) * dt)
 * - Position is expressed in pixels and Velocity by pixels per seconds.
 */
class MovingShape {
    constructor(position, velocity, size, timeRemaining, vao) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.timeRemaining = timeRemaining;
        this.vao = vao;
    }
    isAlive() {
        return this.timeRemaining > 0;
    }
    update(dt) {
        this.position[0] += this.velocity[0] * dt;
        this.position[1] += this.velocity[1] * dt;
        this.timeRemaining -= dt;
    }
}
// Demo Main function.
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Canvas Element.
        const canvas = document.getElementById("webgl-canvas");
        if (!canvas || !(canvas instanceof HTMLCanvasElement))
            throw new Error("Failed to get canvas element.");
        // Rendering Context.
        const gl = getContext(canvas);
        if (!gl) {
            const isWebGLSupported = !!(document.createElement('canvas')).getContext('webgl');
            if (isWebGLSupported) {
                throw new Error("WebGL2 is not supported - try using a different browser.");
            }
            else {
                throw new Error("WebGL is not supported - try using a different browser.");
            }
        }
        // Vertex Buffers.
        const triangleGeoBuffer = createStaticVertexBuffer(gl, triangleVertices);
        const rgbGeoBuffer = createStaticVertexBuffer(gl, rgbTriangleColors);
        const gradientGeoBuffer = createStaticVertexBuffer(gl, gradientTriangleColors);
        if (!triangleGeoBuffer || !rgbGeoBuffer || !gradientGeoBuffer) {
            showError("Failed to create vertex buffers.");
            return;
        }
        // Shaders source code in text format.
        const vertexShaderSource = yield getShaderSource('shaders/vertex_shader.vert');
        const fragmentShaderSource = yield getShaderSource('shaders/fragment_shader.frag');
        // Vertex Shader.
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (vertexShader === null)
            return showError("No GPU Memory to allocate for Vertex Shader.");
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(vertexShader);
            showError(error || "No shader debug log provided.");
            return;
        }
        // Fragment Shader.
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (fragmentShader === null) {
            showError("No GPU Memory to allocate for Fragment Shader.");
            return;
        }
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(fragmentShader);
            showError(error || "No shader debug log provided.");
            return;
        }
        // Program set up for Uniforms.
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            showError(error || "No program debug log provided.");
            return;
        }
        // Get the built-in variables from shaders.
        const vertexPositionAttribute = gl.getAttribLocation(program, 'vertexPosition');
        const vertexColorAttribute = gl.getAttribLocation(program, 'vertexColor');
        if (vertexPositionAttribute < 0 || vertexColorAttribute < 0) {
            showError("Failed to get Attribute Location for vertexPosition.");
            return;
        }
        // Set the Uniforms variables.
        const locationUniform = gl.getUniformLocation(program, 'location');
        const sizeUniform = gl.getUniformLocation(program, 'size');
        const canvasSizeUniform = gl.getUniformLocation(program, 'canvasSize');
        if (locationUniform === null || sizeUniform === null || canvasSizeUniform === null) {
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
        if (!rgbTriangleVAO || !gradientTriangleVAO) {
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
        let shapes = [];
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
        const frame = function () {
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
                const position = [canvas.width / 2, canvas.height / 2];
                const velocity = [
                    Math.sin(angle) * speed,
                    Math.cos(angle) * speed
                ];
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
    });
}
showError("No Errors! 🌞");
try {
    main();
}
catch (e) {
    showError(`Uncaught exception: ${e}`);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/main.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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cUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUM7UUFFRixnREFBZ0Q7UUFDaEQscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakMsQ0FBQztDQUFBO0FBRUQsU0FBUyxDQUFDLGVBQWUsQ0FBQztBQUUxQixJQUFJLENBQUM7SUFBQyxJQUFJLEVBQUUsQ0FBQztBQUFDLENBQUM7QUFBQyxPQUFNLENBQUMsRUFBRSxDQUFDO0lBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsQ0FBQzs7Ozs7Ozs7VUU3VG5FO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9tYWluLnRzIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogLSBEZW1vIGNvbmZpZ3VyYXRpb24gY29uc3RhbnRzXHJcbiAqIERlZmF1bHQ6XHJcbiAqIC0gU1BBV05fUkFURSA9IDAuMDhcclxuICogLSBTSEFQRV9USU1FID0ge01JTjogMC4yNSwgTUFYOiA2fVxyXG4gKiAtIFNIQVBFX1NQRUVEID0ge01JTjogMTI1LCBNQVg6IDM1MH1cclxuICogLSBTSEFQRV9TSVpFID0ge01JTjogMiwgTUFYOiA1MH1cclxuICogLSBTSEFQRV9DT1VOVF9NQVggPSAyNTBcclxuICovXHJcbmNvbnN0IFNQQVdOX1JBVEUgPSAwLjA4O1xyXG5jb25zdCBTSEFQRV9USU1FID0ge01JTjogMC4yNSwgTUFYOiA2fTtcclxuY29uc3QgU0hBUEVfU1BFRUQgPSB7TUlOOiAxMjUsIE1BWDogMzUwfTtcclxuY29uc3QgU0hBUEVfU0laRSA9IHtNSU46IDIsIE1BWDogNTB9O1xyXG5jb25zdCBTSEFQRV9DT1VOVF9NQVggPSAyNTA7XHJcblxyXG4vKipcclxuICogLSBbVG9wLXgsIFRvcC15LCBMZWZ0LXgsIExlZnQteSwgUmlnaHQteCwgUmlnaHQteV1cclxuICogLSBKUyB1c2VzIDY0Yml0IEFycmF5cywgYW5kIENQVSBwcmVmZXIgMzJiaXRzIGZvciBoYWxmIG51bWJlcnMuXHJcbiAqIC0gRGVmYXVsdCB2YWx1ZXMsIGJ1dCBjaGFuZ2VkIGJ5IHNoYWRlcnMuXHJcbiAqL1xyXG5jb25zdCB0cmlhbmdsZVZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheShbMCwgMSwgLTEsIC0xLCAxLCAtMV0pO1xyXG5cclxuY29uc3QgcmdiVHJpYW5nbGVDb2xvcnMgPSBuZXcgVWludDhBcnJheShbXHJcbiAgICAyNTUsIDAsIDAsXHJcbiAgICAwLCAyNTUsIDAsXHJcbiAgICAwLCAwLCAyNTVcclxuXSk7IC8vIENvbG9yc1xyXG5jb25zdCBncmFkaWVudFRyaWFuZ2xlQ29sb3JzID0gbmV3IFVpbnQ4QXJyYXkoW1xyXG4gICAgMjI5LCA0NywgMTUsXHJcbiAgICAyNDYsIDIwNiwgMjksXHJcbiAgICAyMzMsIDE1NCwgMjZcclxuXSk7ICAvLyBDb2xvcnNcclxuXHJcblxyXG4vLyBEaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UgdG8gdGhlIEhUTUwgRWxlbWVudCB3aXRoIGlkIFwiZXJyb3ItY29udGFpbmVyXCIuXHJcbmZ1bmN0aW9uIHNob3dFcnJvcihtc2c6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlcnJvci1jb250YWluZXJcIik7XHJcbiAgICBpZihjb250YWluZXIgPT09IG51bGwpIHJldHVybiBjb25zb2xlLmxvZyhcIk5vIEVsZW1lbnQgd2l0aCBJRDogZXJyb3ItY29udGFpbmVyXCIpO1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gbXNnO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgY29uc29sZS5sb2cobXNnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIC0gQ3JlYXRlIGEgV2ViR0wgQnVmZmVyIHR5cGUuIChPcGFxdWUgSGFuZGxlKVxyXG4gKiAgIC0gU1RBVElDX0RSQVcgbWVhbnMgd2Ugd29udCB1cGRhdGUgb2Z0ZW4sIGJ1dCBvZnRlbiB1c2VkLlxyXG4gKiAgIC0gQVJSQVlfQlVGRkVSIG9uIHRoZSBvdGhlciBzaWRlIGluZGljYXRlIHRoZSBwbGFjZSB0byBzdG9yZSB0aGUgQXJyYXkuXHJcbiAqIC0gRmlyc3QsIHdlIGF0dGFjaCB0aGUgQnVmZmVyIHRvIHRoZSBDUFUuXHJcbiAqIC0gQWRkIEFycmF5IHRvIHRoZSBCdWZmZXIuXHJcbiAqIC0gQ2xlYXIgYWZ0ZXIgdXNlIGFuZCByZXR1cm4gdGhlIGJ1ZmZlci5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0YXRpY1ZlcnRleEJ1ZmZlcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgZGF0YTogQXJyYXlCdWZmZXIpOiBXZWJHTEJ1ZmZlciB7XHJcbiAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIGlmKCFidWZmZXIpIHsgXHJcbiAgICAgICAgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGFsbG9jYXRlIGJ1ZmZlciBzcGFjZVwiKTsgXHJcbiAgICAgICAgcmV0dXJuIDA7IFxyXG4gICAgfVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgcmV0dXJuIGJ1ZmZlclxyXG59XHJcblxyXG4vKipcclxuICogSW5wdXQgYXNzZW1ibGVyIOKGkiBSZWFkIFZlcnRpY2VzIGZyb20gR1BVIEJ1ZmZlci5cclxuICogLSBUZWxsIE9wZW5HTCB0aGUgZGF0YSB0eXBlIHNlbnQgKEZsb2F0LCBBcnJheSwgZXRjKVxyXG4gKiAgIC0gVmVydGV4IFNoYWRlciDihpIgUGxhY2UgVmVydGljZXMgaW4gY2xpcCBzcGFjZS5cclxuICogICAtIEZyYWdtZW50IFNoYWRlciDihpIgQ29sb3IgdGhlIHBpeGVscy5cclxuICogICAtIElmIFZlcnRleCBzaGFkZXIgYW5kIEZyYWdtZW50IHNoYWRlciBhcmUgbm90IHByZXNlbnQ6IE9wZW5HTCB1c2VzIGRlZmF1bHQgMCBldmVyeXdoZXJlLlxyXG4gKiAtIFZlcnRleEF0dHJpYlBvaW50ZXJcclxuICogICAtIEluZGV4IChsb2NhdGlvbilcclxuICogICAtIFNpemUgKENvbXBvbmVudCBwZXIgdmVjdG9yKVxyXG4gKiAgIC0gVHlwZVxyXG4gKiAgIC0gSXNOb3JtYWxpemVkIChpbnQgdG8gZmxvYXRzLCBmb3IgY29sb3IgdHJhbnNmb3JtIFswLCAyNTVdIHRvIGZsb2F0IFswLCAxXSlcclxuICogICAtIFN0cmlkZSAoRGlzdGFuY2UgYmV0d2VlbiBlYWNoIHZlcnRleCBpbiB0aGUgYnVmZmVyKVxyXG4gKiAgIC0gT2Zmc2V0IChOdW1iZXIgb2Ygc2tpcGVkIGJ5dGVzIGJlZm9yZSByZWFkaW5nIGF0dHJpYnV0ZXMpXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVUd29CdWZmZXJWYW8oXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHBvc2l0aW9uQnVmZmVyOiBXZWJHTEJ1ZmZlciwgY29sb3JCdWZmZXI6IFdlYkdMQnVmZmVyLFxyXG4gICAgcG9zaXRpb25BdHRyaWJ1dGU6IG51bWJlciwgY29sb3JBdHRyaWJ1dGU6IG51bWJlclxyXG4pOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0IHtcclxuICAgIGNvbnN0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XHJcbiAgICBpZighdmFvKSB7IHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBWQU8gYnVmZmVyLlwiKTsgcmV0dXJuIDA7IH1cclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zaXRpb25BdHRyaWJ1dGUpO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoY29sb3JBdHRyaWJ1dGUpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHBvc2l0aW9uQnVmZmVyKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zaXRpb25BdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgY29sb3JCdWZmZXIpO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihjb2xvckF0dHJpYnV0ZSwgMywgZ2wuVU5TSUdORURfQllURSwgdHJ1ZSwgMCwgMCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XHJcbiAgICByZXR1cm4gdmFvO1xyXG59XHJcblxyXG4vLyBSZXR1cm4gdGhlIFdlYkdMIENvbnRleHQgZnJvbSB0aGUgQ2FudmFzIEVsZW1lbnQuXHJcbmZ1bmN0aW9uIGdldENvbnRleHQoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgfCBudWxsIHtcclxuICAgIHJldHVybiBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wyJyk7XHJcbn1cclxuXHJcbi8vIEdldCBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiB0d28gbnVtYmVycy5cclxuZnVuY3Rpb24gZ2V0UmFuZG9tSW5SYW5nZShtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcclxufVxyXG5cclxuLy8gR2V0IHNoYWRlcnMgc291cmNlIGNvZGUuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNoYWRlclNvdXJjZSh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBsb2FkaW5nIHNoYWRlciBjb2RlIGF0IFwiJHt1cmx9XCI6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAtIENyZWF0ZSBhIENsYXNzIFwiTW92aW5nU2hhcGVcIiB3aXRoIGEgcG9zaXRpb24sIHZlbG9jaXR5LCBzaXplIGFuZCB2YW8gYXJndW1lbnRzLlxyXG4gKiAtIFRoZSBjbGFzcyBhcyBhIG1ldGhvZCBcInVwZGF0ZVwiIHdpdGggZHQgKGRlbHRhIHRpbWUpIGFyZ3VtZW50LlxyXG4gKiAtIFwiVXBkYXRlXCIgdXBkYXRlIHRoZSBwb3NpdGlvbiBieSBhZGRpbmc6IHBvc2l0aW9uID0gKChwb3NpdGlvbiArIHZlbG9jaXR5KSAqIGR0KVxyXG4gKiAtIFBvc2l0aW9uIGlzIGV4cHJlc3NlZCBpbiBwaXhlbHMgYW5kIFZlbG9jaXR5IGJ5IHBpeGVscyBwZXIgc2Vjb25kcy5cclxuICovXHJcbmNsYXNzIE1vdmluZ1NoYXBlIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSxcclxuICAgICAgICBwdWJsaWMgdmVsb2NpdHk6IFtudW1iZXIsIG51bWJlcl0sXHJcbiAgICAgICAgcHVibGljIHNpemU6IG51bWJlcixcclxuICAgICAgICBwdWJsaWMgdGltZVJlbWFpbmluZzogbnVtYmVyLFxyXG4gICAgICAgIHB1YmxpYyB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3QpIHt9XHJcbiAgICBpc0FsaXZlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVSZW1haW5pbmcgPiAwO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKGR0OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uWzBdICs9IHRoaXMudmVsb2NpdHlbMF0gKiBkdDtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uWzFdICs9IHRoaXMudmVsb2NpdHlbMV0gKiBkdDtcclxuICAgICAgICB0aGlzLnRpbWVSZW1haW5pbmcgLT0gZHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIERlbW8gTWFpbiBmdW5jdGlvbi5cclxuYXN5bmMgZnVuY3Rpb24gbWFpbigpOiBQcm9taXNlPHZvaWQ+IHtcclxuXHJcbiAgICAvLyBDYW52YXMgRWxlbWVudC5cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ2wtY2FudmFzXCIpO1xyXG4gICAgaWYoIWNhbnZhcyB8fCAhKGNhbnZhcyBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50KSkgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGdldCBjYW52YXMgZWxlbWVudC5cIik7XHJcbiAgICBcclxuICAgIC8vIFJlbmRlcmluZyBDb250ZXh0LlxyXG4gICAgY29uc3QgZ2wgPSBnZXRDb250ZXh0KGNhbnZhcyk7XHJcbiAgICBpZighZ2wpIHtcclxuICAgICAgICBjb25zdCBpc1dlYkdMU3VwcG9ydGVkOiBib29sZWFuID0gISEoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykpLmdldENvbnRleHQoJ3dlYmdsJyk7XHJcbiAgICAgICAgaWYoaXNXZWJHTFN1cHBvcnRlZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXZWJHTDIgaXMgbm90IHN1cHBvcnRlZCAtIHRyeSB1c2luZyBhIGRpZmZlcmVudCBicm93c2VyLlwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXZWJHTCBpcyBub3Qgc3VwcG9ydGVkIC0gdHJ5IHVzaW5nIGEgZGlmZmVyZW50IGJyb3dzZXIuXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJ0ZXggQnVmZmVycy5cclxuICAgIGNvbnN0IHRyaWFuZ2xlR2VvQnVmZmVyID0gY3JlYXRlU3RhdGljVmVydGV4QnVmZmVyKGdsLCB0cmlhbmdsZVZlcnRpY2VzKTtcclxuICAgIGNvbnN0IHJnYkdlb0J1ZmZlciA9IGNyZWF0ZVN0YXRpY1ZlcnRleEJ1ZmZlcihnbCwgcmdiVHJpYW5nbGVDb2xvcnMpO1xyXG4gICAgY29uc3QgZ3JhZGllbnRHZW9CdWZmZXIgPSBjcmVhdGVTdGF0aWNWZXJ0ZXhCdWZmZXIoZ2wsIGdyYWRpZW50VHJpYW5nbGVDb2xvcnMpO1xyXG4gICAgaWYoIXRyaWFuZ2xlR2VvQnVmZmVyIHx8ICFyZ2JHZW9CdWZmZXIgfHwgIWdyYWRpZW50R2VvQnVmZmVyKSB7XHJcbiAgICAgICAgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSB2ZXJ0ZXggYnVmZmVycy5cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBTaGFkZXJzIHNvdXJjZSBjb2RlIGluIHRleHQgZm9ybWF0LlxyXG4gICAgY29uc3QgdmVydGV4U2hhZGVyU291cmNlID0gYXdhaXQgZ2V0U2hhZGVyU291cmNlKCdzaGFkZXJzL3ZlcnRleF9zaGFkZXIudmVydCcpO1xyXG4gICAgY29uc3QgZnJhZ21lbnRTaGFkZXJTb3VyY2UgPSBhd2FpdCBnZXRTaGFkZXJTb3VyY2UoJ3NoYWRlcnMvZnJhZ21lbnRfc2hhZGVyLmZyYWcnKTtcclxuXHJcbiAgICAvLyBWZXJ0ZXggU2hhZGVyLlxyXG4gICAgY29uc3QgdmVydGV4U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgaWYodmVydGV4U2hhZGVyID09PSBudWxsKSByZXR1cm4gc2hvd0Vycm9yKFwiTm8gR1BVIE1lbW9yeSB0byBhbGxvY2F0ZSBmb3IgVmVydGV4IFNoYWRlci5cIik7XHJcbiAgICBnbC5zaGFkZXJTb3VyY2UodmVydGV4U2hhZGVyLCB2ZXJ0ZXhTaGFkZXJTb3VyY2UpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0ZXhTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGcmFnbWVudCBTaGFkZXIuXHJcbiAgICBjb25zdCBmcmFnbWVudFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xyXG4gICAgaWYoZnJhZ21lbnRTaGFkZXIgPT09IG51bGwpIHtcclxuICAgICAgICBzaG93RXJyb3IoXCJObyBHUFUgTWVtb3J5IHRvIGFsbG9jYXRlIGZvciBGcmFnbWVudCBTaGFkZXIuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTaGFkZXJTb3VyY2UpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XHJcbiAgICBpZighZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZyYWdtZW50U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm9ncmFtIHNldCB1cCBmb3IgVW5pZm9ybXMuXHJcbiAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleFNoYWRlcik7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICBpZighZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHByb2dyYW0gZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHRoZSBidWlsdC1pbiB2YXJpYWJsZXMgZnJvbSBzaGFkZXJzLlxyXG4gICAgY29uc3QgdmVydGV4UG9zaXRpb25BdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAndmVydGV4UG9zaXRpb24nKTtcclxuICAgIGNvbnN0IHZlcnRleENvbG9yQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleENvbG9yJyk7XHJcbiAgICBpZih2ZXJ0ZXhQb3NpdGlvbkF0dHJpYnV0ZSA8IDAgfHwgdmVydGV4Q29sb3JBdHRyaWJ1dGUgPCAwKSB7XHJcbiAgICAgICAgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGdldCBBdHRyaWJ1dGUgTG9jYXRpb24gZm9yIHZlcnRleFBvc2l0aW9uLlwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IHRoZSBVbmlmb3JtcyB2YXJpYWJsZXMuXHJcbiAgICBjb25zdCBsb2NhdGlvblVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ2xvY2F0aW9uJyk7XHJcbiAgICBjb25zdCBzaXplVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAnc2l6ZScpO1xyXG4gICAgY29uc3QgY2FudmFzU2l6ZVVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ2NhbnZhc1NpemUnKTtcclxuICAgIGlmKGxvY2F0aW9uVW5pZm9ybSA9PT0gbnVsbCB8fCBzaXplVW5pZm9ybSA9PT0gbnVsbCB8fCBjYW52YXNTaXplVW5pZm9ybSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHNob3dFcnJvcihgVW5pZm9ybXMgYXJlIGVtcHR5OlxyXG4gICAgICAgICAgICAtIGxvY2F0aW9uVW5pZm9ybT0ke2xvY2F0aW9uVW5pZm9ybX1cclxuICAgICAgICAgICAgLSBzaXplVW5pZm9ybT0ke3NpemVVbmlmb3JtfVxyXG4gICAgICAgICAgICAtIGNhbnZhc1NpemVVbmlmb3JtPSR7Y2FudmFzU2l6ZVVuaWZvcm19XHJcbiAgICAgICAgICAgIGApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgVkFPIEJ1ZmZlcnMuXHJcbiAgICBjb25zdCByZ2JUcmlhbmdsZVZBTyA9IGNyZWF0ZVR3b0J1ZmZlclZhbyhnbCwgdHJpYW5nbGVHZW9CdWZmZXIsIHJnYkdlb0J1ZmZlciwgdmVydGV4UG9zaXRpb25BdHRyaWJ1dGUsIHZlcnRleENvbG9yQXR0cmlidXRlKTtcclxuICAgIGNvbnN0IGdyYWRpZW50VHJpYW5nbGVWQU8gPSBjcmVhdGVUd29CdWZmZXJWYW8oZ2wsIHRyaWFuZ2xlR2VvQnVmZmVyLCBncmFkaWVudEdlb0J1ZmZlciwgdmVydGV4UG9zaXRpb25BdHRyaWJ1dGUsIHZlcnRleENvbG9yQXR0cmlidXRlKTtcclxuICAgIGlmKCFyZ2JUcmlhbmdsZVZBTyB8fCAhZ3JhZGllbnRUcmlhbmdsZVZBTykge1xyXG4gICAgICAgIHNob3dFcnJvcihgRmFpbGVzIHRvIGNyZWF0ZSBWQU9zOiBcclxuICAgICAgICAgICAgLSByZ2JUcmlhbmdsZT0keyEhcmdiVHJpYW5nbGVWQU99XHJcbiAgICAgICAgICAgIC0gZ3JhZGllbnRUcmlhbmdsZT0keyEhZ3JhZGllbnRUcmlhbmdsZVZBT31cclxuICAgICAgICAgICAgYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogLSBDcmVhdGUgYW4gZW1wdHkgYXJyYXkgdG8gc3RvcmUgb3VyIHNoYXBlcy5cclxuICAgICAqIC0gU2V0IHVwIHRpbWUgdG8gdGhlIG5leHQgc2hhcGUgc3Bhd24gb24gdGhlIFNQQVdOX1JBVEVcclxuICAgICAqIC0gQWRkaW5nIFRpbWUgYmV0d2VlbiBsYXN0IGZyYW1lIC8gbm93IGFzIFwibGFzdEZyYW1lVGltZVwiXHJcbiAgICAgKi9cclxuICAgIGxldCBzaGFwZXM6IE1vdmluZ1NoYXBlW10gPSBbXTtcclxuICAgIGxldCB0aW1lVG9OZXh0U3Bhd24gPSBTUEFXTl9SQVRFO1xyXG4gICAgbGV0IGxhc3RGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIGZ1bmN0aW9uIHRvIGNhbGwgaXQgZWFjaCBmcmFtZS5cclxuICAgICAqIC0gT3V0cHV0IE1lcmdlcjogTWVyZ2UgdGhlIHNoYWRlZCBwaXhlbCBmcmFnbWVudCB3aXRoIHRoZSBleGlzdGluZyBvdXQgaW1hZ2UuXHJcbiAgICAgKiAtIFJhc3Rlcml6ZXI6IFdpY2ggcGl4ZWwgYXJlIHBhcnQgb2YgdGhlIFZlcnRpY2VzICsgV2ljaCBwYXJ0IGlzIG1vZGlmaWVkIGJ5IE9wZW5HTC5cclxuICAgICAqIC0gR1BVIFByb2dyYW06IFBhaXIgVmVydGV4ICYgRnJhZ21lbnQgc2hhZGVycy5cclxuICAgICAqIC0gVW5pZm9ybXM6IFNldHRpbmcgdGhlbSAoY2FuIGJlIHNldCBhbnl3aGVyZSkgKHNpemUvbG9jIGluIHBpeGVscyAocHgpKVxyXG4gICAgICogLSBEcmF3IENhbGxzOiAody8gUHJpbWl0aXZlIGFzc2VtYmx5ICsgZm9yIGxvb3ApXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGZyYW1lID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGR0IHdpdGggdGltZSBpbiBzZWNvbmRzIGJldHdlZW4gZWFjaCBmcmFtZS5cclxuICAgICAgICBjb25zdCB0aGlzRnJhbWVUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgY29uc3QgZHQgPSAodGhpc0ZyYW1lVGltZSAtIGxhc3RGcmFtZVRpbWUpIC8gMTAwMDtcclxuICAgICAgICBsYXN0RnJhbWVUaW1lID0gdGhpc0ZyYW1lVGltZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogLSBVcGRhdGluZyB0aW1lVG9OZXh0U3Bhd24gPSB0aW1lVG9OZXh0U3Bhd24gLSBkdDtcclxuICAgICAgICAgKiAtIFdoaWxlIHRpbWVUb05leHRTcGF3biBpcyBhdCAwLCBhZGQgU1BBV05fUkFURSB0byBpdHNlbGYuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGltZVRvTmV4dFNwYXduIC09IGR0O1xyXG4gICAgICAgIHdoaWxlICh0aW1lVG9OZXh0U3Bhd24gPCAwKSB7XHJcbiAgICAgICAgICAgIHRpbWVUb05leHRTcGF3biArPSBTUEFXTl9SQVRFO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBnZXRSYW5kb21JblJhbmdlKDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICAgICAgY29uc3Qgc3BlZWQgPSBnZXRSYW5kb21JblJhbmdlKFNIQVBFX1NQRUVELk1JTiwgU0hBUEVfU1BFRUQuTUFYKTtcclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0gPSBbY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodCAvIDJdO1xyXG4gICAgICAgICAgICBjb25zdCB2ZWxvY2l0eTogW251bWJlciwgbnVtYmVyXSA9IFtcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGFuZ2xlKSAqIHNwZWVkLFxyXG4gICAgICAgICAgICAgICAgTWF0aC5jb3MoYW5nbGUpICogc3BlZWRcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICBjb25zdCBzaXplID0gZ2V0UmFuZG9tSW5SYW5nZShTSEFQRV9TSVpFLk1JTiwgU0hBUEVfU0laRS5NQVgpO1xyXG4gICAgICAgICAgICBjb25zdCB0aW1lUmVtYWluaW5nID0gZ2V0UmFuZG9tSW5SYW5nZShTSEFQRV9USU1FLk1JTiwgU0hBUEVfVElNRS5NQVgpO1xyXG4gICAgICAgICAgICBjb25zdCB2YW8gPSAoTWF0aC5yYW5kb20oKSA8IDAuNSkgPyByZ2JUcmlhbmdsZVZBTyA6IGdyYWRpZW50VHJpYW5nbGVWQU87XHJcbiAgICAgICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IE1vdmluZ1NoYXBlKHBvc2l0aW9uLCB2ZWxvY2l0eSwgc2l6ZSwgdGltZVJlbWFpbmluZywgdmFvKTtcclxuICAgICAgICAgICAgc2hhcGVzLnB1c2goc2hhcGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIFNoYXBlcy5cclxuICAgICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcclxuICAgICAgICAgICAgc2hhcGUudXBkYXRlKGR0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2hhcGVzID0gc2hhcGVzLmZpbHRlcigoc2hhcGUpID0+IHNoYXBlLmlzQWxpdmUoKSkuc2xpY2UoMCwgU0hBUEVfQ09VTlRfTUFYKTtcclxuXHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMC4wOCwgMC4wOCwgMC4wOCwgMS4wKTtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICAgICAgZ2wudW5pZm9ybTJmKGNhbnZhc1NpemVVbmlmb3JtLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBzaGFwZXMuZm9yRWFjaCgoc2hhcGUpID0+IHtcclxuICAgICAgICAgICAgZ2wudW5pZm9ybTFmKHNpemVVbmlmb3JtLCBzaGFwZS5zaXplKTtcclxuICAgICAgICAgICAgZ2wudW5pZm9ybTJmKGxvY2F0aW9uVW5pZm9ybSwgc2hhcGUucG9zaXRpb25bMF0sIHNoYXBlLnBvc2l0aW9uWzFdKTtcclxuICAgICAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KHNoYXBlLnZhbyk7XHJcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCAwLCAzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gTG9vcCBjYWxscywgZWFjaCB0aW1lIHRoZSBkcmF3aW5nIGlzIHJlYWR5LlxyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEZpcnN0IGNhbGwsIGFzIHNvb24sIGFzIHRoZSBicm93c2VyIGlzIHJlYWR5LlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxuICAgIFxyXG59XHJcblxyXG5zaG93RXJyb3IoXCJObyBFcnJvcnMhIPCfjJ5cIilcclxuXHJcbnRyeSB7IG1haW4oKTsgfSBjYXRjaChlKSB7IHNob3dFcnJvcihgVW5jYXVnaHQgZXhjZXB0aW9uOiAke2V9YCk7IH0iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IHt9O1xuX193ZWJwYWNrX21vZHVsZXNfX1tcIi4vc3JjL21haW4udHNcIl0oKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==