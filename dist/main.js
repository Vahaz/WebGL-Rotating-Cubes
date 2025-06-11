/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/class.ts":
/*!**********************!*\
  !*** ./src/class.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


//
// CLASS
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mat4 = exports.Quat = exports.Vec3 = exports.Shape = exports.MovingShape = void 0;
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
exports.MovingShape = MovingShape;
class Shape {
    constructor(pos, scale, rotationAxis, rotationAngle, vao, numIndices) {
        this.pos = pos;
        this.scale = scale;
        this.rotationAxis = rotationAxis;
        this.rotationAngle = rotationAngle;
        this.vao = vao;
        this.numIndices = numIndices;
        this.matWorld = new Mat4();
        this.scaleVec = new Vec3();
        this.rotation = new Quat();
    }
    draw(gl, matWorldUniform) {
        this.rotation.setAxisAngle(this.rotationAxis, this.rotationAngle);
        this.scaleVec.set(this.scale, this.scale, this.scale);
        this.matWorld.setFromRotationTranslationScale(this.rotation, this.pos, this.scaleVec);
        gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld.m);
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}
exports.Shape = Shape;
class Vec3 {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    subtract(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    multiply(v) { return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z); }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    normalize() {
        const len = Math.hypot(this.x, this.y, this.z);
        return len > 0 ? new Vec3(this.x / len, this.y / len, this.z / len) : new Vec3();
    }
    cross(v) {
        return new Vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
}
exports.Vec3 = Vec3;
class Quat {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    setAxisAngle(axis, angle) {
        const norm = axis.normalize();
        const half = angle / 2;
        const s = Math.sin(half);
        this.x = norm.x * s;
        this.y = norm.y * s;
        this.z = norm.z * s;
        this.w = Math.cos(half);
        return this;
    }
}
exports.Quat = Quat;
class Mat4 {
    constructor() {
        this.m = new Float32Array(16);
        this.identity();
    }
    identity() {
        const m = this.m;
        m.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }
    copyFrom(mat) {
        this.m.set(mat.m);
        return this;
    }
    multiply(other) {
        const a = this.m, b = other.m;
        const out = new Float32Array(16);
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                out[j * 4 + i] =
                    a[0 * 4 + i] * b[j * 4 + 0] +
                        a[1 * 4 + i] * b[j * 4 + 1] +
                        a[2 * 4 + i] * b[j * 4 + 2] +
                        a[3 * 4 + i] * b[j * 4 + 3];
            }
        }
        this.m.set(out);
        return this;
    }
    setPerspective(fovRad, aspect, near, far) {
        const f = 1.0 / Math.tan(fovRad / 2);
        const nf = 1 / (near - far);
        const m = this.m;
        m[0] = f / aspect;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = f;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[12] = 0;
        m[13] = 0;
        m[14] = 2 * far * near * nf;
        m[15] = 0;
        return this;
    }
    setLookAt(eye, center, up) {
        const z = eye.subtract(center).normalize();
        const x = up.cross(z).normalize();
        const y = z.cross(x);
        const m = this.m;
        m[0] = x.x;
        m[1] = y.x;
        m[2] = z.x;
        m[3] = 0;
        m[4] = x.y;
        m[5] = y.y;
        m[6] = z.y;
        m[7] = 0;
        m[8] = x.z;
        m[9] = y.z;
        m[10] = z.z;
        m[11] = 0;
        m[12] = -x.dot(eye);
        m[13] = -y.dot(eye);
        m[14] = -z.dot(eye);
        m[15] = 1;
        return this;
    }
    setFromRotationTranslationScale(q, v, s) {
        const x = q.x, y = q.y, z = q.z, w = q.w;
        const sx = s.x, sy = s.y, sz = s.z;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        const m = this.m;
        m[0] = (1 - (yy + zz)) * sx;
        m[1] = (xy + wz) * sx;
        m[2] = (xz - wy) * sx;
        m[3] = 0;
        m[4] = (xy - wz) * sy;
        m[5] = (1 - (xx + zz)) * sy;
        m[6] = (yz + wx) * sy;
        m[7] = 0;
        m[8] = (xz + wy) * sz;
        m[9] = (yz - wx) * sz;
        m[10] = (1 - (xx + yy)) * sz;
        m[11] = 0;
        m[12] = v.x;
        m[13] = v.y;
        m[14] = v.z;
        m[15] = 1;
        return this;
    }
}
exports.Mat4 = Mat4;


/***/ }),

/***/ "./src/function.ts":
/*!*************************!*\
  !*** ./src/function.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports) {


//
// FUNCTION
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showError = showError;
exports.getRandomInRange = getRandomInRange;
exports.getShaderSource = getShaderSource;
exports.getContext = getContext;
exports.toRadian = toRadian;
exports.createStaticBuffer = createStaticBuffer;
exports.createVAOBuffer = createVAOBuffer;
exports.createProgram = createProgram;
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
// Return the WebGL Context from the Canvas Element.
function getContext(canvas) {
    return canvas.getContext('webgl2');
}
// Convert from degrees to radiant.
function toRadian(angle) {
    return angle * Math.PI / 180;
}
/**
 * Create a WebGL Buffer type. (Opaque Handle)
 * - STATIC_DRAW : wont update often, but often used.
 * - ARRAY_BUFFER : indicate the place to store the Array.
 * - ELEMENT_ARRAY_BUFFER : Used for indices with cube shapes drawing.
 * Bind the Buffer to the CPU, add the Array to the Buffer and Clear after use.
 */
function createStaticBuffer(gl, data, isIndice) {
    const buffer = gl.createBuffer();
    const type = (isIndice == true) ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    if (!buffer) {
        showError("Failed to allocate buffer space");
        return 0;
    }
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);
    gl.bindBuffer(type, null);
    return buffer;
}
/**
 * Create vertex array object buffers, it read the vertices from GPU Buffer.
 * The vertex buffer contains the coordinates and color per vertex. (x, y, z, r, g, b)
 * The index buffer contains wich vertex need to be drawn on scene to avoid surplus.
 * The color attrib pointer is offset by 3 each time to avoid (x, y, z).
 * The vertex shader place the vertices in clip space and the fragment shader color the pixels. (Default: 0)
 * VertexAttribPointer [Index, Size, Type, IsNormalized, Stride, Offset]
 * - Index (location)
 * - Size (Component per vector)
 * - Type
 * - IsNormalized (int to floats, for color transform [0, 255] to float [0, 1])
 * - Stride (Distance between each vertex in the buffer)
 * - Offset (Number of skiped bytes before reading attributes)
 */
function createVAOBuffer(gl, vertexBuffer, indexBuffer, posAttrib, colorAttrib) {
    const vao = gl.createVertexArray();
    if (!vao) {
        showError("Failed to allocate VAO buffer.");
        return 0;
    }
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(posAttrib);
    gl.enableVertexAttribArray(colorAttrib);
    // Interleaved format: (x, y, z, r, g, b) (all f32)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorAttrib, 3, gl.UNSIGNED_BYTE, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return vao;
}
// Create a program and link the vertex and fragment shader source code to it.
function createProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        showError(error || "No shader debug log provided.");
        return 0;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        showError(error || "No shader debug log provided.");
        return 0;
    }
    // Program set up for Uniforms.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        showError(error || "No program debug log provided.");
        return 0;
    }
    return program;
}


/***/ }),

/***/ "./src/geometry.ts":
/*!*************************!*\
  !*** ./src/geometry.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


// Vertex buffer format: XYZ RGB (interleaved)
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TABLE_INDICES = exports.TABLE_VERTICES = exports.CUBE_INDICES = exports.CUBE_VERTICES = void 0;
//
// Cube geometry
// taken from: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
exports.CUBE_VERTICES = new Float32Array([
    // Front face
    -1.0, -1.0, 1.0, 1, 0, 0, // 0
    1.0, -1.0, 1.0, 1, 0, 0, // 1
    1.0, 1.0, 1.0, 1, 0, 0, // 2
    -1.0, 1.0, 1.0, 1, 0, 0, // 3
    // Back face
    -1.0, -1.0, -1.0, 1, 0, 0, // 4
    -1.0, 1.0, -1.0, 1, 0, 0, // 5
    1.0, 1.0, -1.0, 1, 0, 0, // ...
    1.0, -1.0, -1.0, 1, 0, 0,
    // Top face
    -1.0, 1.0, -1.0, 0, 1, 0,
    -1.0, 1.0, 1.0, 0, 1, 0,
    1.0, 1.0, 1.0, 0, 1, 0,
    1.0, 1.0, -1.0, 0, 1, 0,
    // Bottom face
    -1.0, -1.0, -1.0, 0, 1, 0,
    1.0, -1.0, -1.0, 0, 1, 0,
    1.0, -1.0, 1.0, 0, 1, 0,
    -1.0, -1.0, 1.0, 0, 1, 0,
    // Right face
    1.0, -1.0, -1.0, 0, 0, 1,
    1.0, 1.0, -1.0, 0, 0, 1,
    1.0, 1.0, 1.0, 0, 0, 1,
    1.0, -1.0, 1.0, 0, 0, 1,
    // Left face
    -1.0, -1.0, -1.0, 0, 0, 1,
    -1.0, -1.0, 1.0, 0, 0, 1,
    -1.0, 1.0, 1.0, 0, 0, 1,
    -1.0, 1.0, -1.0, 0, 0, 1,
]);
exports.CUBE_INDICES = new Uint16Array([
    0, 1, 2,
    0, 2, 3, // front
    4, 5, 6,
    4, 6, 7, // back
    8, 9, 10,
    8, 10, 11, // top
    12, 13, 14,
    12, 14, 15, // bottom
    16, 17, 18,
    16, 18, 19, // right
    20, 21, 22,
    20, 22, 23, // left
]);
exports.TABLE_VERTICES = new Float32Array([
    // Top face
    -10.0, 0.0, -10.0, 0.2, 0.2, 0.2,
    -10.0, 0.0, 10.0, 0.2, 0.2, 0.2,
    10.0, 0.0, 10.0, 0.2, 0.2, 0.2,
    10.0, 0.0, -10.0, 0.2, 0.2, 0.2,
]);
exports.TABLE_INDICES = new Uint16Array([
    0, 1, 2,
    0, 2, 3, // top
]);


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const fnc = __webpack_require__(/*! ./function */ "./src/function.ts");
const cls = __webpack_require__(/*! ./class */ "./src/class.ts");
const geo = __webpack_require__(/*! ./geometry */ "./src/geometry.ts");
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
const SHAPE_TIME = { MIN: 0.25, MAX: 6 };
const SHAPE_SPEED = { MIN: 125, MAX: 350 };
const SHAPE_SIZE = { MIN: 2, MAX: 50 };
const SHAPE_COUNT_MAX = 250;
// Demo Main fnction.
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Canvas Element and Rendering Context.
        const canvas = document.getElementById("webgl-canvas");
        const gl = fnc.getContext(canvas);
        // Cube and Table vertex and indices buffers.
        const cubeVertices = fnc.createStaticBuffer(gl, geo.CUBE_VERTICES, false);
        const cubeIndices = fnc.createStaticBuffer(gl, geo.CUBE_INDICES, true);
        const tableVertices = fnc.createStaticBuffer(gl, geo.TABLE_VERTICES, false);
        const tableIndices = fnc.createStaticBuffer(gl, geo.TABLE_INDICES, true);
        if (!cubeVertices || !cubeIndices || !tableVertices || !tableIndices) {
            fnc.showError(`Failed to create geo: cube: (v=${!!cubeVertices} i=${cubeIndices}), table=(v=${!!tableVertices} i=${!!tableIndices})`);
            return;
        }
        // Shaders source code in string format and link them to a program.
        const vertexSrc = yield fnc.getShaderSource('shaders/vertex_shader.vert');
        const fragmentSrc = yield fnc.getShaderSource('shaders/fragment_shader.frag');
        const program = fnc.createProgram(gl, vertexSrc, fragmentSrc);
        // Get the built-in variables from shaders, and get the uniforms variable set by the user.
        const positionAttribute = gl.getAttribLocation(program, 'vertexPosition');
        const colorAttribute = gl.getAttribLocation(program, 'vertexColor');
        const matWorldUniform = gl.getUniformLocation(program, 'matWorld');
        const matViewProjUniform = gl.getUniformLocation(program, 'matView');
        if (positionAttribute < 0 || colorAttribute < 0) {
            fnc.showError("Failed to get Attribute Location for vertexPosition.");
            return;
        }
        // Create vertex array object buffers.
        const cubeVAO = fnc.createVAOBuffer(gl, cubeVertices, cubeIndices, positionAttribute, colorAttribute);
        const tableVAO = fnc.createVAOBuffer(gl, tableVertices, tableIndices, positionAttribute, colorAttribute);
        if (!cubeVAO || !tableVAO) {
            fnc.showError(`Failes to create VAOs: cube=${!!cubeVAO}, table=${!!tableVAO}`);
            return;
        }
        // Create an empty array to store our cubes.
        const UP_VEC = new cls.Vec3(0, 1, 0);
        const cubes = [
            new cls.Shape(new cls.Vec3(0, 0, 0), 1, UP_VEC, 0, tableVAO, geo.TABLE_INDICES.length), // Ground
            new cls.Shape(new cls.Vec3(0, 0.4, 0), 0.4, UP_VEC, 0, cubeVAO, geo.CUBE_INDICES.length), // Center
            new cls.Shape(new cls.Vec3(1, 0.05, 1), 0.05, UP_VEC, fnc.toRadian(20), cubeVAO, geo.CUBE_INDICES.length),
            new cls.Shape(new cls.Vec3(1, 0.1, -1), 0.1, UP_VEC, fnc.toRadian(40), cubeVAO, geo.CUBE_INDICES.length),
            new cls.Shape(new cls.Vec3(-1, 0.15, 1), 0.15, UP_VEC, fnc.toRadian(60), cubeVAO, geo.CUBE_INDICES.length),
            new cls.Shape(new cls.Vec3(-1, 0.2, -1), 0.2, UP_VEC, fnc.toRadian(80), cubeVAO, geo.CUBE_INDICES.length),
        ];
        const matView = new cls.Mat4();
        const matProj = new cls.Mat4();
        let matViewProj = new cls.Mat4();
        let cameraAngle = 0;
        /**
         * Add a fnction to call it each frame.
         * - Output Merger: Merge the shaded pixel fragment with the existing out image.
         * - Rasterizer: Wich pixel are part of the Vertices + Wich part is modified by OpenGL.
         * - GPU Program: Pair Vertex & Fragment shaders.
         * - Uniforms: Setting them (can be set anywhere) (size/loc in pixels (px))
         * - Draw Calls: (w/ Primitive assembly + for loop)
         */
        let lastFrameTime = performance.now();
        const frame = function () {
            // Calculate dt with time in seconds between each frame.
            const thisFrameTime = performance.now();
            const dt = (thisFrameTime - lastFrameTime) / 1000;
            lastFrameTime = thisFrameTime;
            // Update
            cameraAngle += dt * fnc.toRadian(10);
            const cameraX = 3 * Math.sin(cameraAngle);
            const cameraZ = 3 * Math.cos(cameraAngle);
            matView.setLookAt(new cls.Vec3(cameraX, 1, cameraZ), new cls.Vec3(0, 0, 0), new cls.Vec3(0, 1, 0));
            matProj.setPerspective(fnc.toRadian(80), // FOV
            canvas.width / canvas.height, // ASPECT RATIO
            0.1, 100.0 // Z-NEAR / Z-FAR
            );
            // in GLM: matViewProj = matProj * matView
            matViewProj = matProj.multiply(matView);
            //
            // Render
            canvas.width = canvas.clientWidth * devicePixelRatio;
            canvas.height = canvas.clientHeight * devicePixelRatio;
            gl.clearColor(0.02, 0.02, 0.02, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.frontFace(gl.CCW);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(program);
            gl.uniformMatrix4fv(matViewProjUniform, false, matViewProj.m);
            cubes.forEach((cube) => cube.draw(gl, matWorldUniform));
            // Loop calls, each time the drawing is ready.
            requestAnimationFrame(frame);
        };
        // First call, as soon, as the browser is ready.
        requestAnimationFrame(frame);
    });
}
fnc.showError("No Errors! 🌞");
try {
    main();
}
catch (e) {
    fnc.showError(`Uncaught exception: ${e}`);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNsQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFakIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCwrQkFBK0IsQ0FBQyxDQUFPLEVBQUUsQ0FBTyxFQUFFLENBQU87UUFDckQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5DLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFNUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVqQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVB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RyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFJLFNBQVM7WUFDbkcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVM7WUFDbkcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDekcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUN4RyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQzFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FB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QyxDQUFDO1lBRS9DLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkIsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN4RCw4Q0FBOEM7WUFDOUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBRUYsZ0RBQWdEO1FBQ2hELHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FBQTtBQUVELEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFL0IsSUFBSSxDQUFDO0lBQUMsSUFBSSxFQUFFLENBQUM7QUFBQyxDQUFDO0FBQUMsT0FBTSxDQUFDLEVBQUUsQ0FBQztJQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxDQUFDOzs7Ozs7O1VDaEp2RTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvY2xhc3MudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZnVuY3Rpb24udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZ2VvbWV0cnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy9cclxuLy8gQ0xBU1NcclxuLy9cclxuXHJcbi8qKlxyXG4gKiAtIENyZWF0ZSBhIENsYXNzIFwiTW92aW5nU2hhcGVcIiB3aXRoIGEgcG9zaXRpb24sIHZlbG9jaXR5LCBzaXplIGFuZCB2YW8gYXJndW1lbnRzLlxyXG4gKiAtIFRoZSBjbGFzcyBhcyBhIG1ldGhvZCBcInVwZGF0ZVwiIHdpdGggZHQgKGRlbHRhIHRpbWUpIGFyZ3VtZW50LlxyXG4gKiAtIFwiVXBkYXRlXCIgdXBkYXRlIHRoZSBwb3NpdGlvbiBieSBhZGRpbmc6IHBvc2l0aW9uID0gKChwb3NpdGlvbiArIHZlbG9jaXR5KSAqIGR0KVxyXG4gKiAtIFBvc2l0aW9uIGlzIGV4cHJlc3NlZCBpbiBwaXhlbHMgYW5kIFZlbG9jaXR5IGJ5IHBpeGVscyBwZXIgc2Vjb25kcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBNb3ZpbmdTaGFwZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgcG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0sXHJcbiAgICAgICAgcHVibGljIHZlbG9jaXR5OiBbbnVtYmVyLCBudW1iZXJdLFxyXG4gICAgICAgIHB1YmxpYyBzaXplOiBudW1iZXIsXHJcbiAgICAgICAgcHVibGljIHRpbWVSZW1haW5pbmc6IG51bWJlcixcclxuICAgICAgICBwdWJsaWMgdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0KSB7fVxyXG4gICAgaXNBbGl2ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aW1lUmVtYWluaW5nID4gMDtcclxuICAgIH1cclxuICAgIHVwZGF0ZShkdDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblswXSArPSB0aGlzLnZlbG9jaXR5WzBdICogZHQ7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblsxXSArPSB0aGlzLnZlbG9jaXR5WzFdICogZHQ7XHJcbiAgICAgICAgdGhpcy50aW1lUmVtYWluaW5nIC09IGR0O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2hhcGUge1xyXG4gIHByaXZhdGUgbWF0V29ybGQgPSBuZXcgTWF0NCgpO1xyXG4gIHByaXZhdGUgc2NhbGVWZWMgPSBuZXcgVmVjMygpO1xyXG4gIHByaXZhdGUgcm90YXRpb24gPSBuZXcgUXVhdCgpO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcG9zOiBWZWMzLFxyXG4gICAgcHJpdmF0ZSBzY2FsZTogbnVtYmVyLFxyXG4gICAgcHJpdmF0ZSByb3RhdGlvbkF4aXM6IFZlYzMsXHJcbiAgICBwcml2YXRlIHJvdGF0aW9uQW5nbGU6IG51bWJlcixcclxuICAgIHB1YmxpYyByZWFkb25seSB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3QsXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbnVtSW5kaWNlczogbnVtYmVyKSB7IH1cclxuXHJcbiAgZHJhdyhnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgbWF0V29ybGRVbmlmb3JtOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbikge1xyXG4gICAgdGhpcy5yb3RhdGlvbi5zZXRBeGlzQW5nbGUodGhpcy5yb3RhdGlvbkF4aXMsIHRoaXMucm90YXRpb25BbmdsZSk7XHJcbiAgICB0aGlzLnNjYWxlVmVjLnNldCh0aGlzLnNjYWxlLCB0aGlzLnNjYWxlLCB0aGlzLnNjYWxlKTtcclxuXHJcbiAgICB0aGlzLm1hdFdvcmxkLnNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUodGhpcy5yb3RhdGlvbiwgdGhpcy5wb3MsIHRoaXMuc2NhbGVWZWMpO1xyXG5cclxuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYobWF0V29ybGRVbmlmb3JtLCBmYWxzZSwgdGhpcy5tYXRXb3JsZC5tKTtcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XHJcbiAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCB0aGlzLm51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICB9XHJcbiAgICBcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFZlYzMge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciA9IDAuMCwgcHVibGljIHk6IG51bWJlciA9IDAuMCwgcHVibGljIHo6IG51bWJlciA9IDAuMCkge31cclxuXHJcbiAgICBhZGQodjogVmVjMyk6IFZlYzMgeyByZXR1cm4gbmV3IFZlYzModGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueikgfVxyXG4gICAgc3VidHJhY3QodjogVmVjMyk6IFZlYzMgeyByZXR1cm4gbmV3IFZlYzModGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueikgfVxyXG4gICAgbXVsdGlwbHkodjogVmVjMyk6IFZlYzMgeyByZXR1cm4gbmV3IFZlYzModGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueikgfVxyXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIG5vcm1hbGl6ZSgpOiBWZWMzIHtcclxuICAgICAgICBjb25zdCBsZW4gPSBNYXRoLmh5cG90KHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xyXG4gICAgICAgIHJldHVybiBsZW4gPiAwID8gbmV3IFZlYzModGhpcy54IC8gbGVuLCB0aGlzLnkgLyBsZW4sIHRoaXMueiAvIGxlbikgOiBuZXcgVmVjMygpO1xyXG4gICAgfVxyXG4gICAgY3Jvc3ModjogVmVjMyk6IFZlYzMge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMyhcclxuICAgICAgICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxyXG4gICAgICAgICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXHJcbiAgICAgICAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBkb3QodjogVmVjMyk6IG51bWJlciB7IHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2LnogfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUXVhdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgeDogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgeTogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgejogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgdzogbnVtYmVyID0gMVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHNldEF4aXNBbmdsZShheGlzOiBWZWMzLCBhbmdsZTogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3Qgbm9ybSA9IGF4aXMubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgaGFsZiA9IGFuZ2xlIC8gMjtcclxuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oaGFsZik7XHJcblxyXG4gICAgICAgIHRoaXMueCA9IG5vcm0ueCAqIHM7XHJcbiAgICAgICAgdGhpcy55ID0gbm9ybS55ICogcztcclxuICAgICAgICB0aGlzLnogPSBub3JtLnogKiBzO1xyXG4gICAgICAgIHRoaXMudyA9IE1hdGguY29zKGhhbGYpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE1hdDQge1xyXG4gICAgcHVibGljIG06IEZsb2F0MzJBcnJheTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm0gPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcclxuICAgICAgICB0aGlzLmlkZW50aXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWRlbnRpdHkoKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBjb3B5RnJvbShtYXQ6IE1hdDQpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm0uc2V0KG1hdC5tKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBtdWx0aXBseShvdGhlcjogTWF0NCk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IGEgPSB0aGlzLm0sIGIgPSBvdGhlci5tO1xyXG4gICAgICAgIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7ICsraSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7ICsraikge1xyXG4gICAgICAgICAgICAgICAgb3V0W2ogKiA0ICsgaV0gPVxyXG4gICAgICAgICAgICAgICAgYVswICogNCArIGldICogYltqICogNCArIDBdICtcclxuICAgICAgICAgICAgICAgIGFbMSAqIDQgKyBpXSAqIGJbaiAqIDQgKyAxXSArXHJcbiAgICAgICAgICAgICAgICBhWzIgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMl0gK1xyXG4gICAgICAgICAgICAgICAgYVszICogNCArIGldICogYltqICogNCArIDNdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm0uc2V0KG91dCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UGVyc3BlY3RpdmUoZm92UmFkOiBudW1iZXIsIGFzcGVjdDogbnVtYmVyLCBuZWFyOiBudW1iZXIsIGZhcjogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgZiA9IDEuMCAvIE1hdGgudGFuKGZvdlJhZCAvIDIpO1xyXG4gICAgICAgIGNvbnN0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG5cclxuICAgICAgICBtWzBdID0gZiAvIGFzcGVjdDtcclxuICAgICAgICBtWzFdID0gMDtcclxuICAgICAgICBtWzJdID0gMDtcclxuICAgICAgICBtWzNdID0gMDtcclxuXHJcbiAgICAgICAgbVs0XSA9IDA7XHJcbiAgICAgICAgbVs1XSA9IGY7XHJcbiAgICAgICAgbVs2XSA9IDA7XHJcbiAgICAgICAgbVs3XSA9IDA7XHJcblxyXG4gICAgICAgIG1bOF0gPSAwO1xyXG4gICAgICAgIG1bOV0gPSAwO1xyXG4gICAgICAgIG1bMTBdID0gKGZhciArIG5lYXIpICogbmY7XHJcbiAgICAgICAgbVsxMV0gPSAtMTtcclxuXHJcbiAgICAgICAgbVsxMl0gPSAwO1xyXG4gICAgICAgIG1bMTNdID0gMDtcclxuICAgICAgICBtWzE0XSA9IDIgKiBmYXIgKiBuZWFyICogbmY7XHJcbiAgICAgICAgbVsxNV0gPSAwO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRMb29rQXQoZXllOiBWZWMzLCBjZW50ZXI6IFZlYzMsIHVwOiBWZWMzKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgeiA9IGV5ZS5zdWJ0cmFjdChjZW50ZXIpLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IHggPSB1cC5jcm9zcyh6KS5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCB5ID0gei5jcm9zcyh4KTtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG5cclxuICAgICAgICBtWzBdID0geC54O1xyXG4gICAgICAgIG1bMV0gPSB5Lng7XHJcbiAgICAgICAgbVsyXSA9IHoueDtcclxuICAgICAgICBtWzNdID0gMDtcclxuXHJcbiAgICAgICAgbVs0XSA9IHgueTtcclxuICAgICAgICBtWzVdID0geS55O1xyXG4gICAgICAgIG1bNl0gPSB6Lnk7XHJcbiAgICAgICAgbVs3XSA9IDA7XHJcblxyXG4gICAgICAgIG1bOF0gPSB4Lno7XHJcbiAgICAgICAgbVs5XSA9IHkuejtcclxuICAgICAgICBtWzEwXSA9IHouejtcclxuICAgICAgICBtWzExXSA9IDA7XHJcblxyXG4gICAgICAgIG1bMTJdID0gLXguZG90KGV5ZSk7XHJcbiAgICAgICAgbVsxM10gPSAteS5kb3QoZXllKTtcclxuICAgICAgICBtWzE0XSA9IC16LmRvdChleWUpO1xyXG4gICAgICAgIG1bMTVdID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShxOiBRdWF0LCB2OiBWZWMzLCBzOiBWZWMzKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgeCA9IHEueCwgeSA9IHEueSwgeiA9IHEueiwgdyA9IHEudztcclxuICAgICAgICBjb25zdCBzeCA9IHMueCwgc3kgPSBzLnksIHN6ID0gcy56O1xyXG5cclxuICAgICAgICBjb25zdCB4MiA9IHggKyB4LCB5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xyXG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XHJcbiAgICAgICAgY29uc3QgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcclxuICAgICAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xyXG5cclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG5cclxuICAgICAgICBtWzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XHJcbiAgICAgICAgbVsxXSA9ICh4eSArIHd6KSAqIHN4O1xyXG4gICAgICAgIG1bMl0gPSAoeHogLSB3eSkgKiBzeDtcclxuICAgICAgICBtWzNdID0gMDtcclxuXHJcbiAgICAgICAgbVs0XSA9ICh4eSAtIHd6KSAqIHN5O1xyXG4gICAgICAgIG1bNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcclxuICAgICAgICBtWzZdID0gKHl6ICsgd3gpICogc3k7XHJcbiAgICAgICAgbVs3XSA9IDA7XHJcblxyXG4gICAgICAgIG1bOF0gPSAoeHogKyB3eSkgKiBzejtcclxuICAgICAgICBtWzldID0gKHl6IC0gd3gpICogc3o7XHJcbiAgICAgICAgbVsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzejtcclxuICAgICAgICBtWzExXSA9IDA7XHJcblxyXG4gICAgICAgIG1bMTJdID0gdi54O1xyXG4gICAgICAgIG1bMTNdID0gdi55O1xyXG4gICAgICAgIG1bMTRdID0gdi56O1xyXG4gICAgICAgIG1bMTVdID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0iLCIvL1xyXG4vLyBGVU5DVElPTlxyXG4vL1xyXG5cclxuLy8gRGlzcGxheSBhbiBlcnJvciBtZXNzYWdlIHRvIHRoZSBIVE1MIEVsZW1lbnQgd2l0aCBpZCBcImVycm9yLWNvbnRhaW5lclwiLlxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVycm9yLWNvbnRhaW5lclwiKTtcclxuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gRWxlbWVudCB3aXRoIElEOiBlcnJvci1jb250YWluZXJcIik7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgZWxlbWVudC5pbm5lclRleHQgPSBtc2c7XHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xyXG59XHJcblxyXG4vLyBHZXQgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdHdvIG51bWJlcnMuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21JblJhbmdlKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xyXG59XHJcblxyXG4vLyBHZXQgc2hhZGVycyBzb3VyY2UgY29kZS5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNoYWRlclNvdXJjZSh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBsb2FkaW5nIHNoYWRlciBjb2RlIGF0IFwiJHt1cmx9XCI6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbn1cclxuXHJcbi8vIFJldHVybiB0aGUgV2ViR0wgQ29udGV4dCBmcm9tIHRoZSBDYW52YXMgRWxlbWVudC5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHQoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xyXG4gICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IDtcclxufVxyXG5cclxuLy8gQ29udmVydCBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFudC5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGFuZ2xlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGFuZ2xlICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIFdlYkdMIEJ1ZmZlciB0eXBlLiAoT3BhcXVlIEhhbmRsZSlcclxuICogLSBTVEFUSUNfRFJBVyA6IHdvbnQgdXBkYXRlIG9mdGVuLCBidXQgb2Z0ZW4gdXNlZC5cclxuICogLSBBUlJBWV9CVUZGRVIgOiBpbmRpY2F0ZSB0aGUgcGxhY2UgdG8gc3RvcmUgdGhlIEFycmF5LlxyXG4gKiAtIEVMRU1FTlRfQVJSQVlfQlVGRkVSIDogVXNlZCBmb3IgaW5kaWNlcyB3aXRoIGN1YmUgc2hhcGVzIGRyYXdpbmcuXHJcbiAqIEJpbmQgdGhlIEJ1ZmZlciB0byB0aGUgQ1BVLCBhZGQgdGhlIEFycmF5IHRvIHRoZSBCdWZmZXIgYW5kIENsZWFyIGFmdGVyIHVzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGF0aWNCdWZmZXIoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGRhdGE6IEFycmF5QnVmZmVyLCBpc0luZGljZTogYm9vbGVhbik6IFdlYkdMQnVmZmVyIHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgY29uc3QgdHlwZSA9IChpc0luZGljZSA9PSB0cnVlKSA/IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSIDogZ2wuQVJSQVlfQlVGRkVSXHJcbiAgICBpZighYnVmZmVyKSB7IFxyXG4gICAgICAgIHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBidWZmZXIgc3BhY2VcIik7IFxyXG4gICAgICAgIHJldHVybiAwOyBcclxuICAgIH1cclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIGJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgbnVsbCk7XHJcblxyXG4gICAgcmV0dXJuIGJ1ZmZlclxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHZlcnRleCBhcnJheSBvYmplY3QgYnVmZmVycywgaXQgcmVhZCB0aGUgdmVydGljZXMgZnJvbSBHUFUgQnVmZmVyLlxyXG4gKiBUaGUgdmVydGV4IGJ1ZmZlciBjb250YWlucyB0aGUgY29vcmRpbmF0ZXMgYW5kIGNvbG9yIHBlciB2ZXJ0ZXguICh4LCB5LCB6LCByLCBnLCBiKVxyXG4gKiBUaGUgaW5kZXggYnVmZmVyIGNvbnRhaW5zIHdpY2ggdmVydGV4IG5lZWQgdG8gYmUgZHJhd24gb24gc2NlbmUgdG8gYXZvaWQgc3VycGx1cy5cclxuICogVGhlIGNvbG9yIGF0dHJpYiBwb2ludGVyIGlzIG9mZnNldCBieSAzIGVhY2ggdGltZSB0byBhdm9pZCAoeCwgeSwgeikuXHJcbiAqIFRoZSB2ZXJ0ZXggc2hhZGVyIHBsYWNlIHRoZSB2ZXJ0aWNlcyBpbiBjbGlwIHNwYWNlIGFuZCB0aGUgZnJhZ21lbnQgc2hhZGVyIGNvbG9yIHRoZSBwaXhlbHMuIChEZWZhdWx0OiAwKVxyXG4gKiBWZXJ0ZXhBdHRyaWJQb2ludGVyIFtJbmRleCwgU2l6ZSwgVHlwZSwgSXNOb3JtYWxpemVkLCBTdHJpZGUsIE9mZnNldF1cclxuICogLSBJbmRleCAobG9jYXRpb24pXHJcbiAqIC0gU2l6ZSAoQ29tcG9uZW50IHBlciB2ZWN0b3IpXHJcbiAqIC0gVHlwZVxyXG4gKiAtIElzTm9ybWFsaXplZCAoaW50IHRvIGZsb2F0cywgZm9yIGNvbG9yIHRyYW5zZm9ybSBbMCwgMjU1XSB0byBmbG9hdCBbMCwgMV0pXHJcbiAqIC0gU3RyaWRlIChEaXN0YW5jZSBiZXR3ZWVuIGVhY2ggdmVydGV4IGluIHRoZSBidWZmZXIpXHJcbiAqIC0gT2Zmc2V0IChOdW1iZXIgb2Ygc2tpcGVkIGJ5dGVzIGJlZm9yZSByZWFkaW5nIGF0dHJpYnV0ZXMpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVkFPQnVmZmVyKFxyXG4gICAgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsXHJcbiAgICB2ZXJ0ZXhCdWZmZXI6IFdlYkdMQnVmZmVyLCBpbmRleEJ1ZmZlcjogV2ViR0xCdWZmZXIsXHJcbiAgICBwb3NBdHRyaWI6IG51bWJlciwgY29sb3JBdHRyaWI6IG51bWJlclxyXG4pOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0IHtcclxuICAgIGNvbnN0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XHJcbiAgICBpZighdmFvKSB7IHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBWQU8gYnVmZmVyLlwiKTsgcmV0dXJuIDA7IH1cclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zQXR0cmliKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGNvbG9yQXR0cmliKTtcclxuICAgIC8vIEludGVybGVhdmVkIGZvcm1hdDogKHgsIHksIHosIHIsIGcsIGIpIChhbGwgZjMyKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHBvc0F0dHJpYiwgMywgZ2wuRkxPQVQsIGZhbHNlLCA2ICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5ULCAwKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoY29sb3JBdHRyaWIsIDMsIGdsLlVOU0lHTkVEX0JZVEUsIGZhbHNlLCA2ICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5ULCAzICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGV4QnVmZmVyKTtcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgcmV0dXJuIHZhbztcclxufVxyXG5cclxuLy8gQ3JlYXRlIGEgcHJvZ3JhbSBhbmQgbGluayB0aGUgdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlIGNvZGUgdG8gaXQuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtKFxyXG4gICAgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsXHJcbiAgICB2ZXJ0ZXhTaGFkZXJTcmM6IHN0cmluZyxcclxuICAgIGZyYWdtZW50U2hhZGVyU3JjOiBzdHJpbmdcclxuKTogV2ViR0xQcm9ncmFtIHtcclxuICAgIGNvbnN0IHZlcnRleFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcclxuICAgIGNvbnN0IGZyYWdtZW50U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XHJcbiAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG5cclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2UodmVydGV4U2hhZGVyLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0ZXhTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XHJcbiAgICBpZighZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZyYWdtZW50U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb2dyYW0gc2V0IHVwIGZvciBVbmlmb3Jtcy5cclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcclxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgaWYoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBwcm9ncmFtIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByb2dyYW07XHJcbn0iLCIvLyBWZXJ0ZXggYnVmZmVyIGZvcm1hdDogWFlaIFJHQiAoaW50ZXJsZWF2ZWQpXHJcblxyXG4vL1xyXG4vLyBDdWJlIGdlb21ldHJ5XHJcbi8vIHRha2VuIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJHTF9BUEkvVHV0b3JpYWwvQ3JlYXRpbmdfM0Rfb2JqZWN0c191c2luZ19XZWJHTFxyXG5leHBvcnQgY29uc3QgQ1VCRV9WRVJUSUNFUyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gIC8vIEZyb250IGZhY2VcclxuICAtMS4wLCAtMS4wLCAxLjAsIDEsIDAsIDAsICAvLyAwXHJcbiAgMS4wLCAtMS4wLCAxLjAsIDEsIDAsIDAsICAgLy8gMVxyXG4gIDEuMCwgMS4wLCAxLjAsIDEsIDAsIDAsICAgIC8vIDJcclxuICAtMS4wLCAxLjAsIDEuMCwgMSwgMCwgMCwgICAvLyAzXHJcblxyXG4gIC8vIEJhY2sgZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIDEsIDAsIDAsIC8vIDRcclxuICAtMS4wLCAxLjAsIC0xLjAsIDEsIDAsIDAsICAvLyA1XHJcbiAgMS4wLCAxLjAsIC0xLjAsIDEsIDAsIDAsICAgLy8gLi4uXHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAxLCAwLCAwLFxyXG5cclxuICAvLyBUb3AgZmFjZVxyXG4gIC0xLjAsIDEuMCwgLTEuMCwgMCwgMSwgMCxcclxuICAtMS4wLCAxLjAsIDEuMCwgMCwgMSwgMCxcclxuICAxLjAsIDEuMCwgMS4wLCAwLCAxLCAwLFxyXG4gIDEuMCwgMS4wLCAtMS4wLCAwLCAxLCAwLFxyXG5cclxuICAvLyBCb3R0b20gZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIDAsIDEsIDAsXHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAwLCAxLCAwLFxyXG4gIDEuMCwgLTEuMCwgMS4wLCAwLCAxLCAwLFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgMCwgMSwgMCxcclxuXHJcbiAgLy8gUmlnaHQgZmFjZVxyXG4gIDEuMCwgLTEuMCwgLTEuMCwgMCwgMCwgMSxcclxuICAxLjAsIDEuMCwgLTEuMCwgMCwgMCwgMSxcclxuICAxLjAsIDEuMCwgMS4wLCAwLCAwLCAxLFxyXG4gIDEuMCwgLTEuMCwgMS4wLCAwLCAwLCAxLFxyXG5cclxuICAvLyBMZWZ0IGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAwLCAwLCAxLFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgMCwgMCwgMSxcclxuICAtMS4wLCAxLjAsIDEuMCwgMCwgMCwgMSxcclxuICAtMS4wLCAxLjAsIC0xLjAsIDAsIDAsIDEsXHJcbl0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IENVQkVfSU5ESUNFUyA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgMCwgMSwgMixcclxuICAwLCAyLCAzLCAvLyBmcm9udFxyXG4gIDQsIDUsIDYsXHJcbiAgNCwgNiwgNywgLy8gYmFja1xyXG4gIDgsIDksIDEwLFxyXG4gIDgsIDEwLCAxMSwgLy8gdG9wXHJcbiAgMTIsIDEzLCAxNCxcclxuICAxMiwgMTQsIDE1LCAvLyBib3R0b21cclxuICAxNiwgMTcsIDE4LFxyXG4gIDE2LCAxOCwgMTksIC8vIHJpZ2h0XHJcbiAgMjAsIDIxLCAyMixcclxuICAyMCwgMjIsIDIzLCAvLyBsZWZ0XHJcbl0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRBQkxFX1ZFUlRJQ0VTID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgLy8gVG9wIGZhY2VcclxuICAtMTAuMCwgMC4wLCAtMTAuMCwgMC4yLCAwLjIsIDAuMixcclxuICAtMTAuMCwgMC4wLCAxMC4wLCAwLjIsIDAuMiwgMC4yLFxyXG4gIDEwLjAsIDAuMCwgMTAuMCwgMC4yLCAwLjIsIDAuMixcclxuICAxMC4wLCAwLjAsIC0xMC4wLCAwLjIsIDAuMiwgMC4yLFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBUQUJMRV9JTkRJQ0VTID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAwLCAxLCAyLFxyXG4gIDAsIDIsIDMsIC8vIHRvcFxyXG5dKTsiLCJpbXBvcnQgKiBhcyBmbmMgZnJvbSBcIi4vZnVuY3Rpb25cIjtcclxuaW1wb3J0ICogYXMgY2xzIGZyb20gXCIuL2NsYXNzXCI7XHJcbmltcG9ydCAqIGFzIG10eCBmcm9tIFwiLi9tYXRyaWNlXCI7XHJcbmltcG9ydCAqIGFzIGdlbyBmcm9tIFwiLi9nZW9tZXRyeVwiO1xyXG5cclxuLy9cclxuLy8gTUFJTlxyXG4vL1xyXG5cclxuLyoqXHJcbiAqIC0gRGVtbyBjb25maWd1cmF0aW9uIGNvbnN0YW50c1xyXG4gKiBEZWZhdWx0OlxyXG4gKiAtIFNQQVdOX1JBVEUgPSAwLjA4XHJcbiAqIC0gU0hBUEVfVElNRSA9IHtNSU46IDAuMjUsIE1BWDogNn1cclxuICogLSBTSEFQRV9TUEVFRCA9IHtNSU46IDEyNSwgTUFYOiAzNTB9XHJcbiAqIC0gU0hBUEVfU0laRSA9IHtNSU46IDIsIE1BWDogNTB9XHJcbiAqIC0gU0hBUEVfQ09VTlRfTUFYID0gMjUwXHJcbiAqL1xyXG5jb25zdCBTUEFXTl9SQVRFID0gMC4wODtcclxuY29uc3QgU0hBUEVfVElNRSA9IHtNSU46IDAuMjUsIE1BWDogNn07XHJcbmNvbnN0IFNIQVBFX1NQRUVEID0ge01JTjogMTI1LCBNQVg6IDM1MH07XHJcbmNvbnN0IFNIQVBFX1NJWkUgPSB7TUlOOiAyLCBNQVg6IDUwfTtcclxuY29uc3QgU0hBUEVfQ09VTlRfTUFYID0gMjUwO1xyXG5cclxuLy8gRGVtbyBNYWluIGZuY3Rpb24uXHJcbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgLy8gQ2FudmFzIEVsZW1lbnQgYW5kIFJlbmRlcmluZyBDb250ZXh0LlxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbC1jYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjb25zdCBnbCA9IGZuYy5nZXRDb250ZXh0KGNhbnZhcyk7XHJcblxyXG4gICAgLy8gQ3ViZSBhbmQgVGFibGUgdmVydGV4IGFuZCBpbmRpY2VzIGJ1ZmZlcnMuXHJcbiAgICBjb25zdCBjdWJlVmVydGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9WRVJUSUNFUywgZmFsc2UpO1xyXG4gICAgY29uc3QgY3ViZUluZGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9JTkRJQ0VTLCB0cnVlKTtcclxuICAgIGNvbnN0IHRhYmxlVmVydGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uVEFCTEVfVkVSVElDRVMsIGZhbHNlKTtcclxuICAgIGNvbnN0IHRhYmxlSW5kaWNlcyA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIGdlby5UQUJMRV9JTkRJQ0VTLCB0cnVlKTtcclxuXHJcbiAgICBpZiAoIWN1YmVWZXJ0aWNlcyB8fCAhY3ViZUluZGljZXMgfHwgIXRhYmxlVmVydGljZXMgfHwgIXRhYmxlSW5kaWNlcykge1xyXG4gICAgICAgIGZuYy5zaG93RXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgZ2VvOiBjdWJlOiAodj0keyEhY3ViZVZlcnRpY2VzfSBpPSR7Y3ViZUluZGljZXN9KSwgdGFibGU9KHY9JHshIXRhYmxlVmVydGljZXN9IGk9JHshIXRhYmxlSW5kaWNlc30pYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNoYWRlcnMgc291cmNlIGNvZGUgaW4gc3RyaW5nIGZvcm1hdCBhbmQgbGluayB0aGVtIHRvIGEgcHJvZ3JhbS5cclxuICAgIGNvbnN0IHZlcnRleFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJ3NoYWRlcnMvdmVydGV4X3NoYWRlci52ZXJ0Jyk7XHJcbiAgICBjb25zdCBmcmFnbWVudFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJ3NoYWRlcnMvZnJhZ21lbnRfc2hhZGVyLmZyYWcnKTtcclxuICAgIGNvbnN0IHByb2dyYW0gPSBmbmMuY3JlYXRlUHJvZ3JhbShnbCwgdmVydGV4U3JjLCBmcmFnbWVudFNyYyk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBidWlsdC1pbiB2YXJpYWJsZXMgZnJvbSBzaGFkZXJzLCBhbmQgZ2V0IHRoZSB1bmlmb3JtcyB2YXJpYWJsZSBzZXQgYnkgdGhlIHVzZXIuXHJcbiAgICBjb25zdCBwb3NpdGlvbkF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICd2ZXJ0ZXhQb3NpdGlvbicpO1xyXG4gICAgY29uc3QgY29sb3JBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAndmVydGV4Q29sb3InKTtcclxuICAgIGNvbnN0IG1hdFdvcmxkVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAnbWF0V29ybGQnKSBhcyBXZWJHTFVuaWZvcm1Mb2NhdGlvbjtcclxuICAgIGNvbnN0IG1hdFZpZXdQcm9qVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAnbWF0VmlldycpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG5cclxuICAgIGlmKHBvc2l0aW9uQXR0cmlidXRlIDwgMCB8fCBjb2xvckF0dHJpYnV0ZSA8IDApIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGdldCBBdHRyaWJ1dGUgTG9jYXRpb24gZm9yIHZlcnRleFBvc2l0aW9uLlwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHZlcnRleCBhcnJheSBvYmplY3QgYnVmZmVycy5cclxuICAgIGNvbnN0IGN1YmVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCBjdWJlVmVydGljZXMsIGN1YmVJbmRpY2VzLCBwb3NpdGlvbkF0dHJpYnV0ZSwgY29sb3JBdHRyaWJ1dGUpO1xyXG4gICAgY29uc3QgdGFibGVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCB0YWJsZVZlcnRpY2VzLCB0YWJsZUluZGljZXMsIHBvc2l0aW9uQXR0cmlidXRlLCBjb2xvckF0dHJpYnV0ZSk7XHJcbiAgICBpZighY3ViZVZBTyB8fCAhdGFibGVWQU8pIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZXMgdG8gY3JlYXRlIFZBT3M6IGN1YmU9JHshIWN1YmVWQU99LCB0YWJsZT0keyEhdGFibGVWQU99YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBlbXB0eSBhcnJheSB0byBzdG9yZSBvdXIgY3ViZXMuXHJcbiAgICBjb25zdCBVUF9WRUMgPSBuZXcgY2xzLlZlYzMoMCwgMSwgMCk7XHJcbiAgICBjb25zdCBjdWJlcyA9IFtcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMuVmVjMygwLCAwLCAwKSwgMSwgVVBfVkVDLCAwLCB0YWJsZVZBTywgZ2VvLlRBQkxFX0lORElDRVMubGVuZ3RoKSwgICAvLyBHcm91bmRcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMuVmVjMygwLCAwLjQsIDApLCAwLjQsIFVQX1ZFQywgMCwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLCAvLyBDZW50ZXJcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMuVmVjMygxLCAwLjA1LCAxKSwgMC4wNSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oMjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLlZlYzMoMSwgMC4xLCAtMSksIDAuMSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNDApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLlZlYzMoLTEsIDAuMTUsIDEpLCAwLjE1LCBVUF9WRUMsIGZuYy50b1JhZGlhbig2MCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMuVmVjMygtMSwgMC4yLCAtMSksIDAuMiwgVVBfVkVDLCBmbmMudG9SYWRpYW4oODApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0IG1hdFZpZXcgPSBuZXcgY2xzLk1hdDQoKTtcclxuICAgIGNvbnN0IG1hdFByb2ogPSBuZXcgY2xzLk1hdDQoKTtcclxuICAgIGxldCBtYXRWaWV3UHJvaiA9IG5ldyBjbHMuTWF0NCgpO1xyXG5cclxuICAgIGxldCBjYW1lcmFBbmdsZSA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIGZuY3Rpb24gdG8gY2FsbCBpdCBlYWNoIGZyYW1lLlxyXG4gICAgICogLSBPdXRwdXQgTWVyZ2VyOiBNZXJnZSB0aGUgc2hhZGVkIHBpeGVsIGZyYWdtZW50IHdpdGggdGhlIGV4aXN0aW5nIG91dCBpbWFnZS5cclxuICAgICAqIC0gUmFzdGVyaXplcjogV2ljaCBwaXhlbCBhcmUgcGFydCBvZiB0aGUgVmVydGljZXMgKyBXaWNoIHBhcnQgaXMgbW9kaWZpZWQgYnkgT3BlbkdMLlxyXG4gICAgICogLSBHUFUgUHJvZ3JhbTogUGFpciBWZXJ0ZXggJiBGcmFnbWVudCBzaGFkZXJzLlxyXG4gICAgICogLSBVbmlmb3JtczogU2V0dGluZyB0aGVtIChjYW4gYmUgc2V0IGFueXdoZXJlKSAoc2l6ZS9sb2MgaW4gcGl4ZWxzIChweCkpXHJcbiAgICAgKiAtIERyYXcgQ2FsbHM6ICh3LyBQcmltaXRpdmUgYXNzZW1ibHkgKyBmb3IgbG9vcClcclxuICAgICAqL1xyXG4gICAgbGV0IGxhc3RGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIGNvbnN0IGZyYW1lID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgZHQgd2l0aCB0aW1lIGluIHNlY29uZHMgYmV0d2VlbiBlYWNoIGZyYW1lLlxyXG4gICAgICAgIGNvbnN0IHRoaXNGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBjb25zdCBkdCA9ICh0aGlzRnJhbWVUaW1lIC0gbGFzdEZyYW1lVGltZSkgLyAxMDAwO1xyXG4gICAgICAgIGxhc3RGcmFtZVRpbWUgPSB0aGlzRnJhbWVUaW1lO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGVcclxuICAgICAgICBjYW1lcmFBbmdsZSArPSBkdCAqIGZuYy50b1JhZGlhbigxMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbWVyYVggPSAzICogTWF0aC5zaW4oY2FtZXJhQW5nbGUpO1xyXG4gICAgICAgIGNvbnN0IGNhbWVyYVogPSAzICogTWF0aC5jb3MoY2FtZXJhQW5nbGUpO1xyXG5cclxuICAgICAgICBtYXRWaWV3LnNldExvb2tBdChcclxuICAgICAgICAgICAgbmV3IGNscy5WZWMzKGNhbWVyYVgsIDEsIGNhbWVyYVopLFxyXG4gICAgICAgICAgICBuZXcgY2xzLlZlYzMoMCwgMCwgMCksXHJcbiAgICAgICAgICAgIG5ldyBjbHMuVmVjMygwLCAxLCAwKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgbWF0UHJvai5zZXRQZXJzcGVjdGl2ZShcclxuICAgICAgICAgICAgZm5jLnRvUmFkaWFuKDgwKSwgLy8gRk9WXHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCAvIGNhbnZhcy5oZWlnaHQsIC8vIEFTUEVDVCBSQVRJT1xyXG4gICAgICAgICAgICAwLjEsIDEwMC4wIC8vIFotTkVBUiAvIFotRkFSXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gaW4gR0xNOiBtYXRWaWV3UHJvaiA9IG1hdFByb2ogKiBtYXRWaWV3XHJcbiAgICAgICAgbWF0Vmlld1Byb2ogPSBtYXRQcm9qLm11bHRpcGx5KG1hdFZpZXcpO1xyXG5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFJlbmRlclxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCAqIGRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG5cclxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMDIsIDAuMDIsIDAuMDIsIDEpO1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XHJcbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNDVyk7XHJcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFZpZXdQcm9qVW5pZm9ybSwgZmFsc2UsIG1hdFZpZXdQcm9qLm0pO1xyXG5cclxuICAgICAgICBjdWJlcy5mb3JFYWNoKChjdWJlKSA9PiBjdWJlLmRyYXcoZ2wsIG1hdFdvcmxkVW5pZm9ybSkpO1xyXG4gICAgICAgIC8vIExvb3AgY2FsbHMsIGVhY2ggdGltZSB0aGUgZHJhd2luZyBpcyByZWFkeS5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBGaXJzdCBjYWxsLCBhcyBzb29uLCBhcyB0aGUgYnJvd3NlciBpcyByZWFkeS5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XHJcbn1cclxuXHJcbmZuYy5zaG93RXJyb3IoXCJObyBFcnJvcnMhIPCfjJ5cIik7XHJcblxyXG50cnkgeyBtYWluKCk7IH0gY2F0Y2goZSkgeyBmbmMuc2hvd0Vycm9yKGBVbmNhdWdodCBleGNlcHRpb246ICR7ZX1gKTsgfSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9tYWluLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9