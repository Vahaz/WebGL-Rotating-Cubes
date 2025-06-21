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
exports.mat4 = exports.quat = exports.vec3 = exports.Shape = void 0;
class Shape {
    constructor(pos, scale, rotationAxis, rotationAngle, vao, numIndices) {
        this.pos = pos;
        this.scale = scale;
        this.rotationAxis = rotationAxis;
        this.rotationAngle = rotationAngle;
        this.vao = vao;
        this.numIndices = numIndices;
        this.matWorld = new mat4();
        this.scaleVec = new vec3();
        this.rotation = new quat();
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
class vec3 {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v) { return new vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    subtract(v) { return new vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    multiply(v) { return new vec3(this.x * v.x, this.y * v.y, this.z * v.z); }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    normalize() {
        const len = Math.hypot(this.x, this.y, this.z);
        return len > 0 ? new vec3(this.x / len, this.y / len, this.z / len) : new vec3();
    }
    cross(v) {
        return new vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
}
exports.vec3 = vec3;
class quat {
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
exports.quat = quat;
class mat4 {
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
    /**
     *  x,  0,  0, 0
     *  0,  y,  0, 0
     *  0,  0,  z, 0
     * tx, ty, tz, 1
     */
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
    /**
     * Perspective matrice, the factor is calculated from the tan of the FOV divided by 2:
     * We have the near plane and far plane. (objects are drawn in-between)
     * aspect is the aspect-ratio like 16:9 on most screens.
     * We change each vertices x, y and z by the following:
     * 0, 0,  0,  0
     * 0, 5,  0,  0
     * 0, 0, 10, 11
     * 0, 0, 14, 15
     */
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
exports.mat4 = mat4;


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
    gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
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
        const vertexSrc = yield fnc.getShaderSource('./shaders/vertex_shader.vert');
        const fragmentSrc = yield fnc.getShaderSource('./shaders/fragment_shader.frag');
        const program = fnc.createProgram(gl, vertexSrc, fragmentSrc);
        // Get the built-in variables from shaders, and get the uniforms variable set by the user.
        const positionAttribute = gl.getAttribLocation(program, 'vertexPosition');
        const colorAttribute = gl.getAttribLocation(program, 'vertexColor');
        const matWorldUniform = gl.getUniformLocation(program, 'matWorld');
        const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj');
        if (positionAttribute < 0 || colorAttribute < 0 || !matWorldUniform || !matViewProjUniform) {
            fnc.showError(`Failed to get attribs/uniforms (Max: ${gl.getParameter(gl.MAX_VERTEX_ATTRIBS)}): ` +
                `pos=${positionAttribute}, color=${colorAttribute} ` +
                `matWorld=${!!matWorldUniform} matViewProj=${!!matViewProjUniform}`);
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
        const UP_VEC = new cls.vec3(0, 1, 0);
        const cubes = [
            new cls.Shape(new cls.vec3(0, 0, 0), 1, UP_VEC, 0, tableVAO, geo.TABLE_INDICES.length), // Ground
            new cls.Shape(new cls.vec3(0, 0.4, 0), 0.4, UP_VEC, 0, cubeVAO, geo.CUBE_INDICES.length), // Center
            new cls.Shape(new cls.vec3(1, 0.05, 1), 0.05, UP_VEC, fnc.toRadian(20), cubeVAO, geo.CUBE_INDICES.length),
            new cls.Shape(new cls.vec3(1, 0.1, -1), 0.1, UP_VEC, fnc.toRadian(40), cubeVAO, geo.CUBE_INDICES.length),
            new cls.Shape(new cls.vec3(-1, 0.15, 1), 0.15, UP_VEC, fnc.toRadian(60), cubeVAO, geo.CUBE_INDICES.length),
            new cls.Shape(new cls.vec3(-1, 0.2, -1), 0.2, UP_VEC, fnc.toRadian(80), cubeVAO, geo.CUBE_INDICES.length),
        ];
        let matView = new cls.mat4();
        let matProj = new cls.mat4();
        let matViewProj = new cls.mat4();
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
            matView.setLookAt(new cls.vec3(cameraX, 1, cameraZ), new cls.vec3(0, 0, 0), new cls.vec3(0, 1, 0));
            matProj.setPerspective(fnc.toRadian(80), // FOV
            canvas.width / canvas.height, // ASPECT RATIO
            0.1, 100.0 // Z-NEAR / Z-FAR
            );
            // in GLM: matViewProj = matProj * matView
            matViewProj = matProj.multiply(matView);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsU0FBUztRQUNMLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckYsQ0FBQztJQUNELEtBQUssQ0FBQyxDQUFPO1FBQ1QsT0FBTyxJQUFJLElBQUksQ0FDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUM5QixDQUFDO0lBQ04sQ0FBQztJQUNELEdBQUcsQ0FBQyxDQUFPLElBQVksT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDO0NBQzdFO0FB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UUFDekMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFNUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVqQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVCxDQUFD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Q0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyQyxNQUFNLEtBQUssR0FBRztZQUNWLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBSSxTQUFTO1lBQ25HLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTO1lBQ25HLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQ3pHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDeEcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0s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R0FBRyxDQUFDLENBQUM7WUFDckIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRS9DLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkIsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN4RCw4Q0FBOEM7WUFDOUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBQ0YsZ0RBQWdEO1FBQ2hELHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FBQTtBQUVELEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFL0IsSUFBSSxDQUFDO0lBQUMsSUFBSSxFQUFFLENBQUM7QUFBQyxDQUFDO0FBQUMsT0FBTSxDQUFDLEVBQUUsQ0FBQztJQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxDQUFDOzs7Ozs7O1VDakl2RTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvY2xhc3MudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZnVuY3Rpb24udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZ2VvbWV0cnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy9cclxuLy8gQ0xBU1NcclxuLy9cclxuXHJcbmV4cG9ydCBjbGFzcyBTaGFwZSB7XHJcbiAgcHJpdmF0ZSBtYXRXb3JsZCA9IG5ldyBtYXQ0KCk7XHJcbiAgcHJpdmF0ZSBzY2FsZVZlYyA9IG5ldyB2ZWMzKCk7XHJcbiAgcHJpdmF0ZSByb3RhdGlvbiA9IG5ldyBxdWF0KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBwb3M6IHZlYzMsXHJcbiAgICBwcml2YXRlIHNjYWxlOiBudW1iZXIsXHJcbiAgICBwcml2YXRlIHJvdGF0aW9uQXhpczogdmVjMyxcclxuICAgIHByaXZhdGUgcm90YXRpb25BbmdsZTogbnVtYmVyLFxyXG4gICAgcHVibGljIHJlYWRvbmx5IHZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCxcclxuICAgIHB1YmxpYyByZWFkb25seSBudW1JbmRpY2VzOiBudW1iZXIpIHsgfVxyXG5cclxuICBkcmF3KGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBtYXRXb3JsZFVuaWZvcm06IFdlYkdMVW5pZm9ybUxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLnJvdGF0aW9uLnNldEF4aXNBbmdsZSh0aGlzLnJvdGF0aW9uQXhpcywgdGhpcy5yb3RhdGlvbkFuZ2xlKTtcclxuICAgIHRoaXMuc2NhbGVWZWMuc2V0KHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUpO1xyXG5cclxuICAgIHRoaXMubWF0V29ybGQuc2V0RnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSh0aGlzLnJvdGF0aW9uLCB0aGlzLnBvcywgdGhpcy5zY2FsZVZlYyk7XHJcblxyXG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRXb3JsZFVuaWZvcm0sIGZhbHNlLCB0aGlzLm1hdFdvcmxkLm0pO1xyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KHRoaXMudmFvKTtcclxuICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIHRoaXMubnVtSW5kaWNlcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xyXG4gIH1cclxuICAgIFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgdmVjMyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyID0gMC4wLCBwdWJsaWMgeTogbnVtYmVyID0gMC4wLCBwdWJsaWMgejogbnVtYmVyID0gMC4wKSB7fVxyXG5cclxuICAgIGFkZCh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56KSB9XHJcbiAgICBzdWJ0cmFjdCh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSwgdGhpcy56IC0gdi56KSB9XHJcbiAgICBtdWx0aXBseSh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56KSB9XHJcbiAgICBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsaXplKCk6IHZlYzMge1xyXG4gICAgICAgIGNvbnN0IGxlbiA9IE1hdGguaHlwb3QodGhpcy54LCB0aGlzLnksIHRoaXMueik7XHJcbiAgICAgICAgcmV0dXJuIGxlbiA+IDAgPyBuZXcgdmVjMyh0aGlzLnggLyBsZW4sIHRoaXMueSAvIGxlbiwgdGhpcy56IC8gbGVuKSA6IG5ldyB2ZWMzKCk7XHJcbiAgICB9XHJcbiAgICBjcm9zcyh2OiB2ZWMzKTogdmVjMyB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKFxyXG4gICAgICAgICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXHJcbiAgICAgICAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcclxuICAgICAgICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIGRvdCh2OiB2ZWMzKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYueiB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBxdWF0IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyB4OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB5OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB6OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB3OiBudW1iZXIgPSAxXHJcbiAgICApIHt9XHJcblxyXG4gICAgc2V0QXhpc0FuZ2xlKGF4aXM6IHZlYzMsIGFuZ2xlOiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBub3JtID0gYXhpcy5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCBoYWxmID0gYW5nbGUgLyAyO1xyXG4gICAgICAgIGNvbnN0IHMgPSBNYXRoLnNpbihoYWxmKTtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gbm9ybS54ICogcztcclxuICAgICAgICB0aGlzLnkgPSBub3JtLnkgKiBzO1xyXG4gICAgICAgIHRoaXMueiA9IG5vcm0ueiAqIHM7XHJcbiAgICAgICAgdGhpcy53ID0gTWF0aC5jb3MoaGFsZik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgbWF0NCB7XHJcbiAgICBwdWJsaWMgbTogRmxvYXQzMkFycmF5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubSA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xyXG4gICAgICAgIHRoaXMuaWRlbnRpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZGVudGl0eSgpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG4gICAgICAgIG0uc2V0KFtcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvcHlGcm9tKG1hdDogbWF0NCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMubS5zZXQobWF0Lm0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiAgeCwgIDAsICAwLCAwXHJcbiAgICAgKiAgMCwgIHksICAwLCAwXHJcbiAgICAgKiAgMCwgIDAsICB6LCAwXHJcbiAgICAgKiB0eCwgdHksIHR6LCAxXHJcbiAgICAgKi9cclxuICAgIG11bHRpcGx5KG90aGVyOiBtYXQ0KTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgYSA9IHRoaXMubSwgYiA9IG90aGVyLm07XHJcbiAgICAgICAgY29uc3Qgb3V0ID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRbaiAqIDQgKyBpXSA9XHJcbiAgICAgICAgICAgICAgICBhWzAgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMF0gK1xyXG4gICAgICAgICAgICAgICAgYVsxICogNCArIGldICogYltqICogNCArIDFdICtcclxuICAgICAgICAgICAgICAgIGFbMiAqIDQgKyBpXSAqIGJbaiAqIDQgKyAyXSArXHJcbiAgICAgICAgICAgICAgICBhWzMgKiA0ICsgaV0gKiBiW2ogKiA0ICsgM107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubS5zZXQob3V0KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBlcnNwZWN0aXZlIG1hdHJpY2UsIHRoZSBmYWN0b3IgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSB0YW4gb2YgdGhlIEZPViBkaXZpZGVkIGJ5IDI6XHJcbiAgICAgKiBXZSBoYXZlIHRoZSBuZWFyIHBsYW5lIGFuZCBmYXIgcGxhbmUuIChvYmplY3RzIGFyZSBkcmF3biBpbi1iZXR3ZWVuKVxyXG4gICAgICogYXNwZWN0IGlzIHRoZSBhc3BlY3QtcmF0aW8gbGlrZSAxNjo5IG9uIG1vc3Qgc2NyZWVucy5cclxuICAgICAqIFdlIGNoYW5nZSBlYWNoIHZlcnRpY2VzIHgsIHkgYW5kIHogYnkgdGhlIGZvbGxvd2luZzpcclxuICAgICAqIDAsIDAsICAwLCAgMFxyXG4gICAgICogMCwgNSwgIDAsICAwXHJcbiAgICAgKiAwLCAwLCAxMCwgMTFcclxuICAgICAqIDAsIDAsIDE0LCAxNVxyXG4gICAgICovXHJcbiAgICBzZXRQZXJzcGVjdGl2ZShmb3ZSYWQ6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBmID0gMS4wIC8gTWF0aC50YW4oZm92UmFkIC8gMik7XHJcbiAgICAgICAgY29uc3QgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcblxyXG4gICAgICAgIG1bMF0gPSBmIC8gYXNwZWN0O1xyXG4gICAgICAgIG1bMV0gPSAwO1xyXG4gICAgICAgIG1bMl0gPSAwO1xyXG4gICAgICAgIG1bM10gPSAwO1xyXG5cclxuICAgICAgICBtWzRdID0gMDtcclxuICAgICAgICBtWzVdID0gZjtcclxuICAgICAgICBtWzZdID0gMDtcclxuICAgICAgICBtWzddID0gMDtcclxuXHJcbiAgICAgICAgbVs4XSA9IDA7XHJcbiAgICAgICAgbVs5XSA9IDA7XHJcbiAgICAgICAgbVsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcclxuICAgICAgICBtWzExXSA9IC0xO1xyXG5cclxuICAgICAgICBtWzEyXSA9IDA7XHJcbiAgICAgICAgbVsxM10gPSAwO1xyXG4gICAgICAgIG1bMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZjtcclxuICAgICAgICBtWzE1XSA9IDA7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExvb2tBdChleWU6IHZlYzMsIGNlbnRlcjogdmVjMywgdXA6IHZlYzMpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCB6ID0gZXllLnN1YnRyYWN0KGNlbnRlcikubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgeCA9IHVwLmNyb3NzKHopLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IHkgPSB6LmNyb3NzKHgpO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcblxyXG4gICAgICAgIG1bMF0gPSB4Lng7XHJcbiAgICAgICAgbVsxXSA9IHkueDtcclxuICAgICAgICBtWzJdID0gei54O1xyXG4gICAgICAgIG1bM10gPSAwO1xyXG5cclxuICAgICAgICBtWzRdID0geC55O1xyXG4gICAgICAgIG1bNV0gPSB5Lnk7XHJcbiAgICAgICAgbVs2XSA9IHoueTtcclxuICAgICAgICBtWzddID0gMDtcclxuXHJcbiAgICAgICAgbVs4XSA9IHguejtcclxuICAgICAgICBtWzldID0geS56O1xyXG4gICAgICAgIG1bMTBdID0gei56O1xyXG4gICAgICAgIG1bMTFdID0gMDtcclxuXHJcbiAgICAgICAgbVsxMl0gPSAteC5kb3QoZXllKTtcclxuICAgICAgICBtWzEzXSA9IC15LmRvdChleWUpO1xyXG4gICAgICAgIG1bMTRdID0gLXouZG90KGV5ZSk7XHJcbiAgICAgICAgbVsxNV0gPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHE6IHF1YXQsIHY6IHZlYzMsIHM6IHZlYzMpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCB4ID0gcS54LCB5ID0gcS55LCB6ID0gcS56LCB3ID0gcS53O1xyXG4gICAgICAgIGNvbnN0IHN4ID0gcy54LCBzeSA9IHMueSwgc3ogPSBzLno7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geCArIHgsIHkyID0geSArIHksIHoyID0geiArIHo7XHJcbiAgICAgICAgY29uc3QgeHggPSB4ICogeDIsIHh5ID0geCAqIHkyLCB4eiA9IHggKiB6MjtcclxuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MiwgeXogPSB5ICogejIsIHp6ID0geiAqIHoyO1xyXG4gICAgICAgIGNvbnN0IHd4ID0gdyAqIHgyLCB3eSA9IHcgKiB5Miwgd3ogPSB3ICogejI7XHJcblxyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcblxyXG4gICAgICAgIG1bMF0gPSAoMSAtICh5eSArIHp6KSkgKiBzeDtcclxuICAgICAgICBtWzFdID0gKHh5ICsgd3opICogc3g7XHJcbiAgICAgICAgbVsyXSA9ICh4eiAtIHd5KSAqIHN4O1xyXG4gICAgICAgIG1bM10gPSAwO1xyXG5cclxuICAgICAgICBtWzRdID0gKHh5IC0gd3opICogc3k7XHJcbiAgICAgICAgbVs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xyXG4gICAgICAgIG1bNl0gPSAoeXogKyB3eCkgKiBzeTtcclxuICAgICAgICBtWzddID0gMDtcclxuXHJcbiAgICAgICAgbVs4XSA9ICh4eiArIHd5KSAqIHN6O1xyXG4gICAgICAgIG1bOV0gPSAoeXogLSB3eCkgKiBzejtcclxuICAgICAgICBtWzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xyXG4gICAgICAgIG1bMTFdID0gMDtcclxuXHJcbiAgICAgICAgbVsxMl0gPSB2Lng7XHJcbiAgICAgICAgbVsxM10gPSB2Lnk7XHJcbiAgICAgICAgbVsxNF0gPSB2Lno7XHJcbiAgICAgICAgbVsxNV0gPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSIsIi8vXHJcbi8vIEZVTkNUSU9OXHJcbi8vXHJcblxyXG4vLyBEaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UgdG8gdGhlIEhUTUwgRWxlbWVudCB3aXRoIGlkIFwiZXJyb3ItY29udGFpbmVyXCIuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3IobXNnOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXJyb3ItY29udGFpbmVyXCIpO1xyXG4gICAgaWYoY29udGFpbmVyID09PSBudWxsKSByZXR1cm4gY29uc29sZS5sb2coXCJObyBFbGVtZW50IHdpdGggSUQ6IGVycm9yLWNvbnRhaW5lclwiKTtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICBlbGVtZW50LmlubmVyVGV4dCA9IG1zZztcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbn1cclxuXHJcbi8vIEdldCBzaGFkZXJzIHNvdXJjZSBjb2RlLlxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2hhZGVyU291cmNlKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGxvYWRpbmcgc2hhZGVyIGNvZGUgYXQgXCIke3VybH1cIjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcclxufVxyXG5cclxuLy8gUmV0dXJuIHRoZSBXZWJHTCBDb250ZXh0IGZyb20gdGhlIENhbnZhcyBFbGVtZW50LlxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCB7XHJcbiAgICByZXR1cm4gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsMicpIGFzIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgO1xyXG59XHJcblxyXG4vLyBDb252ZXJ0IGZyb20gZGVncmVlcyB0byByYWRpYW50LlxyXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYW5nbGU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gYW5nbGUgKiBNYXRoLlBJIC8gMTgwO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgV2ViR0wgQnVmZmVyIHR5cGUuIChPcGFxdWUgSGFuZGxlKVxyXG4gKiAtIFNUQVRJQ19EUkFXIDogd29udCB1cGRhdGUgb2Z0ZW4sIGJ1dCBvZnRlbiB1c2VkLlxyXG4gKiAtIEFSUkFZX0JVRkZFUiA6IGluZGljYXRlIHRoZSBwbGFjZSB0byBzdG9yZSB0aGUgQXJyYXkuXHJcbiAqIC0gRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiBVc2VkIGZvciBpbmRpY2VzIHdpdGggY3ViZSBzaGFwZXMgZHJhd2luZy5cclxuICogQmluZCB0aGUgQnVmZmVyIHRvIHRoZSBDUFUsIGFkZCB0aGUgQXJyYXkgdG8gdGhlIEJ1ZmZlciBhbmQgQ2xlYXIgYWZ0ZXIgdXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0YXRpY0J1ZmZlcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgZGF0YTogQXJyYXlCdWZmZXIsIGlzSW5kaWNlOiBib29sZWFuKTogV2ViR0xCdWZmZXIge1xyXG4gICAgY29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICBjb25zdCB0eXBlID0gKGlzSW5kaWNlID09IHRydWUpID8gZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiBnbC5BUlJBWV9CVUZGRVJcclxuICAgIGlmKCFidWZmZXIpIHsgXHJcbiAgICAgICAgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGFsbG9jYXRlIGJ1ZmZlciBzcGFjZVwiKTsgXHJcbiAgICAgICAgcmV0dXJuIDA7IFxyXG4gICAgfVxyXG5cclxuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgYnVmZmVyKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEodHlwZSwgZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcih0eXBlLCBudWxsKTtcclxuICAgIHJldHVybiBidWZmZXJcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSB2ZXJ0ZXggYXJyYXkgb2JqZWN0IGJ1ZmZlcnMsIGl0IHJlYWQgdGhlIHZlcnRpY2VzIGZyb20gR1BVIEJ1ZmZlci5cclxuICogVGhlIHZlcnRleCBidWZmZXIgY29udGFpbnMgdGhlIGNvb3JkaW5hdGVzIGFuZCBjb2xvciBwZXIgdmVydGV4LiAoeCwgeSwgeiwgciwgZywgYilcclxuICogVGhlIGluZGV4IGJ1ZmZlciBjb250YWlucyB3aWNoIHZlcnRleCBuZWVkIHRvIGJlIGRyYXduIG9uIHNjZW5lIHRvIGF2b2lkIHN1cnBsdXMuXHJcbiAqIFRoZSBjb2xvciBhdHRyaWIgcG9pbnRlciBpcyBvZmZzZXQgYnkgMyBlYWNoIHRpbWUgdG8gYXZvaWQgKHgsIHksIHopLlxyXG4gKiBUaGUgdmVydGV4IHNoYWRlciBwbGFjZSB0aGUgdmVydGljZXMgaW4gY2xpcCBzcGFjZSBhbmQgdGhlIGZyYWdtZW50IHNoYWRlciBjb2xvciB0aGUgcGl4ZWxzLiAoRGVmYXVsdDogMClcclxuICogVmVydGV4QXR0cmliUG9pbnRlciBbSW5kZXgsIFNpemUsIFR5cGUsIElzTm9ybWFsaXplZCwgU3RyaWRlLCBPZmZzZXRdXHJcbiAqIC0gSW5kZXggKGxvY2F0aW9uKVxyXG4gKiAtIFNpemUgKENvbXBvbmVudCBwZXIgdmVjdG9yKVxyXG4gKiAtIFR5cGVcclxuICogLSBJc05vcm1hbGl6ZWQgKGludCB0byBmbG9hdHMsIGZvciBjb2xvciB0cmFuc2Zvcm0gWzAsIDI1NV0gdG8gZmxvYXQgWzAsIDFdKVxyXG4gKiAtIFN0cmlkZSAoRGlzdGFuY2UgYmV0d2VlbiBlYWNoIHZlcnRleCBpbiB0aGUgYnVmZmVyKVxyXG4gKiAtIE9mZnNldCAoTnVtYmVyIG9mIHNraXBlZCBieXRlcyBiZWZvcmUgcmVhZGluZyBhdHRyaWJ1dGVzKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZBT0J1ZmZlcihcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgaW5kZXhCdWZmZXI6IFdlYkdMQnVmZmVyLFxyXG4gICAgcG9zQXR0cmliOiBudW1iZXIsIGNvbG9yQXR0cmliOiBudW1iZXJcclxuKTogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCB7XHJcbiAgICBjb25zdCB2YW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xyXG4gICAgaWYoIXZhbykgeyBzaG93RXJyb3IoXCJGYWlsZWQgdG8gYWxsb2NhdGUgVkFPIGJ1ZmZlci5cIik7IHJldHVybiAwOyB9XHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkodmFvKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHBvc0F0dHJpYik7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShjb2xvckF0dHJpYik7XHJcbiAgICAvLyBJbnRlcmxlYXZlZCBmb3JtYXQ6ICh4LCB5LCB6LCByLCBnLCBiKSAoYWxsIGYzMilcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NBdHRyaWIsIDMsIGdsLkZMT0FULCBmYWxzZSwgNiAqIEZsb2F0MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVCwgMCk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGNvbG9yQXR0cmliLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDYgKiBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQsIDMgKiBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhCdWZmZXIpO1xyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICByZXR1cm4gdmFvO1xyXG59XHJcblxyXG4vLyBDcmVhdGUgYSBwcm9ncmFtIGFuZCBsaW5rIHRoZSB2ZXJ0ZXggYW5kIGZyYWdtZW50IHNoYWRlciBzb3VyY2UgY29kZSB0byBpdC5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHZlcnRleFNoYWRlclNyYzogc3RyaW5nLFxyXG4gICAgZnJhZ21lbnRTaGFkZXJTcmM6IHN0cmluZ1xyXG4pOiBXZWJHTFByb2dyYW0ge1xyXG4gICAgY29uc3QgdmVydGV4U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpIGFzIFdlYkdMU2hhZGVyO1xyXG4gICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcclxuICAgIGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblxyXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydGV4U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydGV4U2hhZGVyKTtcclxuICAgIGlmKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodmVydGV4U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2UoZnJhZ21lbnRTaGFkZXIsIGZyYWdtZW50U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcihmcmFnbWVudFNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKGZyYWdtZW50U2hhZGVyKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm9ncmFtIHNldCB1cCBmb3IgVW5pZm9ybXMuXHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XHJcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgIGlmKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSk7XHJcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gcHJvZ3JhbSBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHByb2dyYW07XHJcbn0iLCIvLyBWZXJ0ZXggYnVmZmVyIGZvcm1hdDogWFlaIFJHQiAoaW50ZXJsZWF2ZWQpXHJcblxyXG4vL1xyXG4vLyBDdWJlIGdlb21ldHJ5XHJcbi8vIHRha2VuIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJHTF9BUEkvVHV0b3JpYWwvQ3JlYXRpbmdfM0Rfb2JqZWN0c191c2luZ19XZWJHTFxyXG5leHBvcnQgY29uc3QgQ1VCRV9WRVJUSUNFUyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gIC8vIEZyb250IGZhY2VcclxuICAtMS4wLCAtMS4wLCAxLjAsIDEsIDAsIDAsICAvLyAwXHJcbiAgMS4wLCAtMS4wLCAxLjAsIDEsIDAsIDAsICAgLy8gMVxyXG4gIDEuMCwgMS4wLCAxLjAsIDEsIDAsIDAsICAgIC8vIDJcclxuICAtMS4wLCAxLjAsIDEuMCwgMSwgMCwgMCwgICAvLyAzXHJcblxyXG4gIC8vIEJhY2sgZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIDEsIDAsIDAsIC8vIDRcclxuICAtMS4wLCAxLjAsIC0xLjAsIDEsIDAsIDAsICAvLyA1XHJcbiAgMS4wLCAxLjAsIC0xLjAsIDEsIDAsIDAsICAgLy8gLi4uXHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAxLCAwLCAwLFxyXG5cclxuICAvLyBUb3AgZmFjZVxyXG4gIC0xLjAsIDEuMCwgLTEuMCwgMCwgMSwgMCxcclxuICAtMS4wLCAxLjAsIDEuMCwgMCwgMSwgMCxcclxuICAxLjAsIDEuMCwgMS4wLCAwLCAxLCAwLFxyXG4gIDEuMCwgMS4wLCAtMS4wLCAwLCAxLCAwLFxyXG5cclxuICAvLyBCb3R0b20gZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIDAsIDEsIDAsXHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAwLCAxLCAwLFxyXG4gIDEuMCwgLTEuMCwgMS4wLCAwLCAxLCAwLFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgMCwgMSwgMCxcclxuXHJcbiAgLy8gUmlnaHQgZmFjZVxyXG4gIDEuMCwgLTEuMCwgLTEuMCwgMCwgMCwgMSxcclxuICAxLjAsIDEuMCwgLTEuMCwgMCwgMCwgMSxcclxuICAxLjAsIDEuMCwgMS4wLCAwLCAwLCAxLFxyXG4gIDEuMCwgLTEuMCwgMS4wLCAwLCAwLCAxLFxyXG5cclxuICAvLyBMZWZ0IGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAwLCAwLCAxLFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgMCwgMCwgMSxcclxuICAtMS4wLCAxLjAsIDEuMCwgMCwgMCwgMSxcclxuICAtMS4wLCAxLjAsIC0xLjAsIDAsIDAsIDEsXHJcbl0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IENVQkVfSU5ESUNFUyA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgMCwgMSwgMixcclxuICAwLCAyLCAzLCAvLyBmcm9udFxyXG4gIDQsIDUsIDYsXHJcbiAgNCwgNiwgNywgLy8gYmFja1xyXG4gIDgsIDksIDEwLFxyXG4gIDgsIDEwLCAxMSwgLy8gdG9wXHJcbiAgMTIsIDEzLCAxNCxcclxuICAxMiwgMTQsIDE1LCAvLyBib3R0b21cclxuICAxNiwgMTcsIDE4LFxyXG4gIDE2LCAxOCwgMTksIC8vIHJpZ2h0XHJcbiAgMjAsIDIxLCAyMixcclxuICAyMCwgMjIsIDIzLCAvLyBsZWZ0XHJcbl0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRBQkxFX1ZFUlRJQ0VTID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgLy8gVG9wIGZhY2VcclxuICAtMTAuMCwgMC4wLCAtMTAuMCwgMC4yLCAwLjIsIDAuMixcclxuICAtMTAuMCwgMC4wLCAxMC4wLCAwLjIsIDAuMiwgMC4yLFxyXG4gIDEwLjAsIDAuMCwgMTAuMCwgMC4yLCAwLjIsIDAuMixcclxuICAxMC4wLCAwLjAsIC0xMC4wLCAwLjIsIDAuMiwgMC4yLFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBUQUJMRV9JTkRJQ0VTID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAwLCAxLCAyLFxyXG4gIDAsIDIsIDMsIC8vIHRvcFxyXG5dKTsiLCJpbXBvcnQgKiBhcyBmbmMgZnJvbSBcIi4vZnVuY3Rpb25cIjtcclxuaW1wb3J0ICogYXMgY2xzIGZyb20gXCIuL2NsYXNzXCI7XHJcbmltcG9ydCAqIGFzIGdlbyBmcm9tIFwiLi9nZW9tZXRyeVwiO1xyXG5cclxuLy9cclxuLy8gTUFJTlxyXG4vL1xyXG5cclxuLy8gRGVtbyBNYWluIGZuY3Rpb24uXHJcbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgLy8gQ2FudmFzIEVsZW1lbnQgYW5kIFJlbmRlcmluZyBDb250ZXh0LlxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbC1jYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjb25zdCBnbCA9IGZuYy5nZXRDb250ZXh0KGNhbnZhcyk7XHJcblxyXG4gICAgLy8gQ3ViZSBhbmQgVGFibGUgdmVydGV4IGFuZCBpbmRpY2VzIGJ1ZmZlcnMuXHJcbiAgICBjb25zdCBjdWJlVmVydGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9WRVJUSUNFUywgZmFsc2UpO1xyXG4gICAgY29uc3QgY3ViZUluZGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9JTkRJQ0VTLCB0cnVlKTtcclxuICAgIGNvbnN0IHRhYmxlVmVydGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uVEFCTEVfVkVSVElDRVMsIGZhbHNlKTtcclxuICAgIGNvbnN0IHRhYmxlSW5kaWNlcyA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIGdlby5UQUJMRV9JTkRJQ0VTLCB0cnVlKTtcclxuXHJcbiAgICBpZiAoIWN1YmVWZXJ0aWNlcyB8fCAhY3ViZUluZGljZXMgfHwgIXRhYmxlVmVydGljZXMgfHwgIXRhYmxlSW5kaWNlcykge1xyXG4gICAgICAgIGZuYy5zaG93RXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgZ2VvOiBjdWJlOiAodj0keyEhY3ViZVZlcnRpY2VzfSBpPSR7Y3ViZUluZGljZXN9KSwgdGFibGU9KHY9JHshIXRhYmxlVmVydGljZXN9IGk9JHshIXRhYmxlSW5kaWNlc30pYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNoYWRlcnMgc291cmNlIGNvZGUgaW4gc3RyaW5nIGZvcm1hdCBhbmQgbGluayB0aGVtIHRvIGEgcHJvZ3JhbS5cclxuICAgIGNvbnN0IHZlcnRleFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy92ZXJ0ZXhfc2hhZGVyLnZlcnQnKTtcclxuICAgIGNvbnN0IGZyYWdtZW50U3JjID0gYXdhaXQgZm5jLmdldFNoYWRlclNvdXJjZSgnLi9zaGFkZXJzL2ZyYWdtZW50X3NoYWRlci5mcmFnJyk7XHJcbiAgICBjb25zdCBwcm9ncmFtID0gZm5jLmNyZWF0ZVByb2dyYW0oZ2wsIHZlcnRleFNyYywgZnJhZ21lbnRTcmMpO1xyXG5cclxuICAgIC8vIEdldCB0aGUgYnVpbHQtaW4gdmFyaWFibGVzIGZyb20gc2hhZGVycywgYW5kIGdldCB0aGUgdW5pZm9ybXMgdmFyaWFibGUgc2V0IGJ5IHRoZSB1c2VyLlxyXG4gICAgY29uc3QgcG9zaXRpb25BdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAndmVydGV4UG9zaXRpb24nKTtcclxuICAgIGNvbnN0IGNvbG9yQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleENvbG9yJyk7XHJcbiAgICBjb25zdCBtYXRXb3JsZFVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFdvcmxkJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcbiAgICBjb25zdCBtYXRWaWV3UHJvalVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFZpZXdQcm9qJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcblxyXG4gICAgaWYocG9zaXRpb25BdHRyaWJ1dGUgPCAwIHx8IGNvbG9yQXR0cmlidXRlIDwgMCB8fCAhbWF0V29ybGRVbmlmb3JtIHx8ICFtYXRWaWV3UHJvalVuaWZvcm0pIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gZ2V0IGF0dHJpYnMvdW5pZm9ybXMgKE1heDogJHtnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9BVFRSSUJTKX0pOiBgICtcclxuICAgICAgICAgICAgIGBwb3M9JHtwb3NpdGlvbkF0dHJpYnV0ZX0sIGNvbG9yPSR7Y29sb3JBdHRyaWJ1dGV9IGAgK1xyXG4gICAgICAgICAgICBgbWF0V29ybGQ9JHshIW1hdFdvcmxkVW5pZm9ybX0gbWF0Vmlld1Byb2o9JHshIW1hdFZpZXdQcm9qVW5pZm9ybX1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHZlcnRleCBhcnJheSBvYmplY3QgYnVmZmVycy5cclxuICAgIGNvbnN0IGN1YmVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCBjdWJlVmVydGljZXMsIGN1YmVJbmRpY2VzLCBwb3NpdGlvbkF0dHJpYnV0ZSwgY29sb3JBdHRyaWJ1dGUpO1xyXG4gICAgY29uc3QgdGFibGVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCB0YWJsZVZlcnRpY2VzLCB0YWJsZUluZGljZXMsIHBvc2l0aW9uQXR0cmlidXRlLCBjb2xvckF0dHJpYnV0ZSk7XHJcbiAgICBpZighY3ViZVZBTyB8fCAhdGFibGVWQU8pIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZXMgdG8gY3JlYXRlIFZBT3M6IGN1YmU9JHshIWN1YmVWQU99LCB0YWJsZT0keyEhdGFibGVWQU99YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBlbXB0eSBhcnJheSB0byBzdG9yZSBvdXIgY3ViZXMuXHJcbiAgICBjb25zdCBVUF9WRUMgPSBuZXcgY2xzLnZlYzMoMCwgMSwgMCk7XHJcbiAgICBjb25zdCBjdWJlcyA9IFtcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygwLCAwLCAwKSwgMSwgVVBfVkVDLCAwLCB0YWJsZVZBTywgZ2VvLlRBQkxFX0lORElDRVMubGVuZ3RoKSwgICAvLyBHcm91bmRcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygwLCAwLjQsIDApLCAwLjQsIFVQX1ZFQywgMCwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLCAvLyBDZW50ZXJcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygxLCAwLjA1LCAxKSwgMC4wNSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oMjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoMSwgMC4xLCAtMSksIDAuMSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNDApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoLTEsIDAuMTUsIDEpLCAwLjE1LCBVUF9WRUMsIGZuYy50b1JhZGlhbig2MCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygtMSwgMC4yLCAtMSksIDAuMiwgVVBfVkVDLCBmbmMudG9SYWRpYW4oODApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICBdO1xyXG5cclxuICAgIGxldCBtYXRWaWV3ID0gbmV3IGNscy5tYXQ0KCk7XHJcbiAgICBsZXQgbWF0UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xyXG4gICAgbGV0IG1hdFZpZXdQcm9qID0gbmV3IGNscy5tYXQ0KCk7XHJcblxyXG4gICAgbGV0IGNhbWVyYUFuZ2xlID0gMDtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgZm5jdGlvbiB0byBjYWxsIGl0IGVhY2ggZnJhbWUuXHJcbiAgICAgKiAtIE91dHB1dCBNZXJnZXI6IE1lcmdlIHRoZSBzaGFkZWQgcGl4ZWwgZnJhZ21lbnQgd2l0aCB0aGUgZXhpc3Rpbmcgb3V0IGltYWdlLlxyXG4gICAgICogLSBSYXN0ZXJpemVyOiBXaWNoIHBpeGVsIGFyZSBwYXJ0IG9mIHRoZSBWZXJ0aWNlcyArIFdpY2ggcGFydCBpcyBtb2RpZmllZCBieSBPcGVuR0wuXHJcbiAgICAgKiAtIEdQVSBQcm9ncmFtOiBQYWlyIFZlcnRleCAmIEZyYWdtZW50IHNoYWRlcnMuXHJcbiAgICAgKiAtIFVuaWZvcm1zOiBTZXR0aW5nIHRoZW0gKGNhbiBiZSBzZXQgYW55d2hlcmUpIChzaXplL2xvYyBpbiBwaXhlbHMgKHB4KSlcclxuICAgICAqIC0gRHJhdyBDYWxsczogKHcvIFByaW1pdGl2ZSBhc3NlbWJseSArIGZvciBsb29wKVxyXG4gICAgICovXHJcbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgY29uc3QgZnJhbWUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBkdCB3aXRoIHRpbWUgaW4gc2Vjb25kcyBiZXR3ZWVuIGVhY2ggZnJhbWUuXHJcbiAgICAgICAgY29uc3QgdGhpc0ZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIGNvbnN0IGR0ID0gKHRoaXNGcmFtZVRpbWUgLSBsYXN0RnJhbWVUaW1lKSAvIDEwMDA7XHJcbiAgICAgICAgbGFzdEZyYW1lVGltZSA9IHRoaXNGcmFtZVRpbWU7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZVxyXG4gICAgICAgIGNhbWVyYUFuZ2xlICs9IGR0ICogZm5jLnRvUmFkaWFuKDEwKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2FtZXJhWCA9IDMgKiBNYXRoLnNpbihjYW1lcmFBbmdsZSk7XHJcbiAgICAgICAgY29uc3QgY2FtZXJhWiA9IDMgKiBNYXRoLmNvcyhjYW1lcmFBbmdsZSk7XHJcblxyXG4gICAgICAgIG1hdFZpZXcuc2V0TG9va0F0KFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoY2FtZXJhWCwgMSwgY2FtZXJhWiksXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAwLCAwKSxcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDEsIDApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBtYXRQcm9qLnNldFBlcnNwZWN0aXZlKFxyXG4gICAgICAgICAgICBmbmMudG9SYWRpYW4oODApLCAvLyBGT1ZcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCwgLy8gQVNQRUNUIFJBVElPXHJcbiAgICAgICAgICAgIDAuMSwgMTAwLjAgLy8gWi1ORUFSIC8gWi1GQVJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBpbiBHTE06IG1hdFZpZXdQcm9qID0gbWF0UHJvaiAqIG1hdFZpZXdcclxuICAgICAgICBtYXRWaWV3UHJvaiA9IG1hdFByb2oubXVsdGlwbHkobWF0Vmlldyk7XHJcblxyXG4gICAgICAgIC8vIFJlbmRlclxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCAqIGRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG5cclxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMDIsIDAuMDIsIDAuMDIsIDEpO1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XHJcbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNDVyk7XHJcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFZpZXdQcm9qVW5pZm9ybSwgZmFsc2UsIG1hdFZpZXdQcm9qLm0pO1xyXG5cclxuICAgICAgICBjdWJlcy5mb3JFYWNoKChjdWJlKSA9PiBjdWJlLmRyYXcoZ2wsIG1hdFdvcmxkVW5pZm9ybSkpO1xyXG4gICAgICAgIC8vIExvb3AgY2FsbHMsIGVhY2ggdGltZSB0aGUgZHJhd2luZyBpcyByZWFkeS5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gICAgfTtcclxuICAgIC8vIEZpcnN0IGNhbGwsIGFzIHNvb24sIGFzIHRoZSBicm93c2VyIGlzIHJlYWR5LlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxufVxyXG5cclxuZm5jLnNob3dFcnJvcihcIk5vIEVycm9ycyEg8J+MnlwiKTtcclxuXHJcbnRyeSB7IG1haW4oKTsgfSBjYXRjaChlKSB7IGZuYy5zaG93RXJyb3IoYFVuY2F1Z2h0IGV4Y2VwdGlvbjogJHtlfWApOyB9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL21haW4udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=