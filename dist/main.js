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
            fnc.showError(`Failed to get attribs/uniforms: ` +
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsU0FBUztRQUNMLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckYsQ0FBQztJQUNELEtBQUssQ0FBQyxDQUFPO1FBQ1QsT0FBTyxJQUFJLElBQUksQ0FDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUM5QixDQUFDO0lBQ04sQ0FBQztJQUNELEdBQUcsQ0FBQyxDQUFPLElBQVksT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDO0NBQzdFO0FB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UUFDekMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFNUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVqQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBckpELG9CQXFKQzs7Ozs7Ozs7Ozs7O0FDcE9ELEVBQUU7QUFDRixXQUFXO0FBQ1gsRUFBRTs7Ozs7Ozs7Ozs7QUFHRiw4QkFPQztBQUdELDBDQU1DO0FBR0QsZ0NBRUM7QUFHRCw0QkFFQztBQVNELGdEQVlDO0FBZ0JELDBDQW1CQztBQUdELHNDQW1DQztBQXpIRCwwRUFBMEU7QUFDMUUsU0FBZ0IsU0FBUyxDQUFDLEdBQVc7SUFDakMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzdELElBQUcsU0FBUyxLQUFLLElBQUk7UUFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUNqRixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQ3hCLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixDQUFDO0FBRUQsMkJBQTJCO0FBQzNCLFNBQXNCLGVBQWUsQ0FBQyxHQUFXOztRQUM3QyxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMzQixDQUFDO0NBQUE7QUFFRCxvREFBb0Q7QUFDcEQsU0FBZ0IsVUFBVSxDQUFDLE1BQXlCO0lBQ2hELE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQTJCLENBQUU7QUFDbEUsQ0FBQztBQUVELG1DQUFtQztBQUNuQyxTQUFnQixRQUFRLENBQUMsS0FBYTtJQUNsQyxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNqQyxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsRUFBMEIsRUFBRSxJQUFpQixFQUFFLFFBQWlCO0lBQy9GLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNqQyxNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWTtJQUMzRSxJQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDVCxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1QixFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFCLE9BQU8sTUFBTTtBQUNqQixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILFNBQWdCLGVBQWUsQ0FDM0IsRUFBMEIsRUFDMUIsWUFBeUIsRUFBRSxXQUF3QixFQUNuRCxTQUFpQixFQUFFLFdBQW1CO0lBRXRDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLElBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ25FLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN4QyxtREFBbUQ7SUFDbkQsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzdDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0YsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDaEksRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3BELEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0MsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBRUQsOEVBQThFO0FBQzlFLFNBQWdCLGFBQWEsQ0FDekIsRUFBMEIsRUFDMUIsZUFBdUIsRUFDdkIsaUJBQXlCO0lBRXpCLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBZ0IsQ0FBQztJQUN0RSxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQWdCLENBQUM7SUFDMUUsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRW5DLEVBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQy9DLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDL0IsSUFBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7UUFDekQsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELFNBQVMsQ0FBQyxLQUFLLElBQUksK0JBQStCLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxFQUFFLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25ELEVBQUUsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDakMsSUFBRyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7UUFDM0QsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xELFNBQVMsQ0FBQyxLQUFLLElBQUksK0JBQStCLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCwrQkFBK0I7SUFDL0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdkMsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDekMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixJQUFHLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUNsRCxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsU0FBUyxDQUFDLEtBQUssSUFBSSxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7Ozs7Ozs7Ozs7OztBQzdIRCw4Q0FBOEM7OztBQUU5QyxFQUFFO0FBQ0YsZ0JBQWdCO0FBQ2hCLGtIQUFrSDtBQUNyRyxxQkFBYSxHQUFHLElBQUksWUFBWSxDQUFDO0lBQzVDLGFBQWE7SUFDYixDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsSUFBSTtJQUMvQixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFJLElBQUk7SUFDL0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUssSUFBSTtJQUMvQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFJLElBQUk7SUFFL0IsWUFBWTtJQUNaLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUk7SUFDL0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLElBQUk7SUFDL0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSSxNQUFNO0lBQ2pDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFFeEIsV0FBVztJQUNYLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDeEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdkIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBRXZCLGNBQWM7SUFDZCxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUN4QixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUN2QixDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBRXhCLGFBQWE7SUFDYixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3hCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3ZCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUN0QixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUV2QixZQUFZO0lBQ1osQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3pCLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDeEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdkIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUN6QixDQUFDLENBQUM7QUFFVSxvQkFBWSxHQUFHLElBQUksV0FBVyxDQUFDO0lBQzFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVE7SUFDakIsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTztJQUNoQixDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDUixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNO0lBQ2pCLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUNWLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVM7SUFDckIsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0lBQ1YsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUTtJQUNwQixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7SUFDVixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPO0NBQ3BCLENBQUMsQ0FBQztBQUVVLHNCQUFjLEdBQUcsSUFBSSxZQUFZLENBQUM7SUFDN0MsV0FBVztJQUNYLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7SUFDaEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7SUFDL0IsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0lBQzlCLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0NBQ2hDLENBQUMsQ0FBQztBQUVVLHFCQUFhLEdBQUcsSUFBSSxXQUFXLENBQUM7SUFDM0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTTtDQUNoQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyRUgsdUVBQWtDO0FBQ2xDLGlFQUErQjtBQUMvQix1RUFBa0M7QUFFbEMsRUFBRTtBQUNGLE9BQU87QUFDUCxFQUFFO0FBRUYscUJBQXFCO0FBQ3JCLFNBQWUsSUFBSTs7UUFFZix3Q0FBd0M7UUFDeEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQXNCLENBQUM7UUFDNUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVsQyw2Q0FBNkM7UUFDN0MsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFFLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RSxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpFLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNuRSxHQUFHLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsWUFBWSxNQUFNLFdBQVcsZUFBZSxDQUFDLENBQUMsYUFBYSxNQUFNLENBQUMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3RJLE9BQU87UUFDWCxDQUFDO1FBRUQsbUVBQW1FO1FBQ25FLE1BQU0sU0FBUyxHQUFHLE1BQU0sR0FBRyxDQUFDLGVBQWUsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sV0FBVyxHQUFHLE1BQU0sR0FBRyxDQUFDLGVBQWUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUU5RCwwRkFBMEY7UUFDMUYsTUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDMUUsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNwRSxNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBeUIsQ0FBQztRQUMzRixNQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUF5QixDQUFDO1FBRWpHLElBQUcsaUJBQWlCLEdBQUcsQ0FBQyxJQUFJLGNBQWMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3hGLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0NBQWtDO2dCQUMzQyxPQUFPLGlCQUFpQixXQUFXLGNBQWMsR0FBRztnQkFDckQsWUFBWSxDQUFDLENBQUMsZUFBZSxnQkFBZ0IsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQ3RFLENBQUM7WUFDRixPQUFPO1FBQ1gsQ0FBQztRQUVELHNDQUFzQztRQUN0QyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDekcsSUFBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3ZCLEdBQUcsQ0FBQyxTQUFTLENBQUMsK0JBQStCLENBQUMsQ0FBQyxPQUFPLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDL0UsT0FBTztRQUNYLENBQUM7UUFFRCw0Q0FBNEM7UUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckMsTUFBTSxLQUFLLEdBQUc7WUFDVixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUksU0FBUztZQUNuRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUztZQUNuRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUN6RyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQ3hHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDMUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1NBQzVHLENBQUM7UUFFRixJQUFJLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVqQyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDcEI7Ozs7Ozs7V0FPRztRQUNILElBQUksYUFBYSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QyxNQUFNLEtBQUssR0FBRztZQUNWLHdEQUF3RDtZQUN4RCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2xELGFBQWEsR0FBRyxhQUFhLENBQUM7WUFFOUIsU0FBUztZQUNULFdBQVcsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVyQyxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxQyxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUxQyxPQUFPLENBQUMsU0FBUyxDQUNiLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUNqQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDckIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3hCLENBQUM7WUFDRixPQUFPLENBQUMsY0FBYyxDQUNsQixHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU07WUFDeEIsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQWU7WUFDN0MsR0FBRyxFQUFFLEtBQUssQ0FBQyxpQkFBaUI7YUFDL0IsQ0FBQztZQUVGLDBDQUEwQztZQUMxQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV4QyxTQUFTO1lBQ1QsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxHQUFHLGdCQUFnQixDQUFDO1lBQ3JELE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztZQUV2RCxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25DLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pCLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUvQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTlELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsOENBQThDO1lBQzlDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQztRQUNGLGdEQUFnRDtRQUNoRCxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQUE7QUFFRCxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRS9CLElBQUksQ0FBQztJQUFDLElBQUksRUFBRSxDQUFDO0FBQUMsQ0FBQztBQUFDLE9BQU0sQ0FBQyxFQUFFLENBQUM7SUFBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsQ0FBQzs7Ozs7OztVQ2pJdkU7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYmdsLy4vc3JjL2NsYXNzLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL2Z1bmN0aW9uLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL2dlb21ldHJ5LnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vXHJcbi8vIENMQVNTXHJcbi8vXHJcblxyXG5leHBvcnQgY2xhc3MgU2hhcGUge1xyXG4gIHByaXZhdGUgbWF0V29ybGQgPSBuZXcgbWF0NCgpO1xyXG4gIHByaXZhdGUgc2NhbGVWZWMgPSBuZXcgdmVjMygpO1xyXG4gIHByaXZhdGUgcm90YXRpb24gPSBuZXcgcXVhdCgpO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcG9zOiB2ZWMzLFxyXG4gICAgcHJpdmF0ZSBzY2FsZTogbnVtYmVyLFxyXG4gICAgcHJpdmF0ZSByb3RhdGlvbkF4aXM6IHZlYzMsXHJcbiAgICBwcml2YXRlIHJvdGF0aW9uQW5nbGU6IG51bWJlcixcclxuICAgIHB1YmxpYyByZWFkb25seSB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3QsXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbnVtSW5kaWNlczogbnVtYmVyKSB7IH1cclxuXHJcbiAgZHJhdyhnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgbWF0V29ybGRVbmlmb3JtOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbikge1xyXG4gICAgdGhpcy5yb3RhdGlvbi5zZXRBeGlzQW5nbGUodGhpcy5yb3RhdGlvbkF4aXMsIHRoaXMucm90YXRpb25BbmdsZSk7XHJcbiAgICB0aGlzLnNjYWxlVmVjLnNldCh0aGlzLnNjYWxlLCB0aGlzLnNjYWxlLCB0aGlzLnNjYWxlKTtcclxuXHJcbiAgICB0aGlzLm1hdFdvcmxkLnNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUodGhpcy5yb3RhdGlvbiwgdGhpcy5wb3MsIHRoaXMuc2NhbGVWZWMpO1xyXG5cclxuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYobWF0V29ybGRVbmlmb3JtLCBmYWxzZSwgdGhpcy5tYXRXb3JsZC5tKTtcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XHJcbiAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCB0aGlzLm51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICB9XHJcbiAgICBcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIHZlYzMge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciA9IDAuMCwgcHVibGljIHk6IG51bWJlciA9IDAuMCwgcHVibGljIHo6IG51bWJlciA9IDAuMCkge31cclxuXHJcbiAgICBhZGQodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueikgfVxyXG4gICAgc3VidHJhY3QodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueikgfVxyXG4gICAgbXVsdGlwbHkodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueikgfVxyXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIG5vcm1hbGl6ZSgpOiB2ZWMzIHtcclxuICAgICAgICBjb25zdCBsZW4gPSBNYXRoLmh5cG90KHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xyXG4gICAgICAgIHJldHVybiBsZW4gPiAwID8gbmV3IHZlYzModGhpcy54IC8gbGVuLCB0aGlzLnkgLyBsZW4sIHRoaXMueiAvIGxlbikgOiBuZXcgdmVjMygpO1xyXG4gICAgfVxyXG4gICAgY3Jvc3ModjogdmVjMyk6IHZlYzMge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMyhcclxuICAgICAgICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxyXG4gICAgICAgICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXHJcbiAgICAgICAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBkb3QodjogdmVjMyk6IG51bWJlciB7IHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2LnogfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgcXVhdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgeDogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgeTogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgejogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgdzogbnVtYmVyID0gMVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHNldEF4aXNBbmdsZShheGlzOiB2ZWMzLCBhbmdsZTogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3Qgbm9ybSA9IGF4aXMubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgaGFsZiA9IGFuZ2xlIC8gMjtcclxuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oaGFsZik7XHJcblxyXG4gICAgICAgIHRoaXMueCA9IG5vcm0ueCAqIHM7XHJcbiAgICAgICAgdGhpcy55ID0gbm9ybS55ICogcztcclxuICAgICAgICB0aGlzLnogPSBub3JtLnogKiBzO1xyXG4gICAgICAgIHRoaXMudyA9IE1hdGguY29zKGhhbGYpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIG1hdDQge1xyXG4gICAgcHVibGljIG06IEZsb2F0MzJBcnJheTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm0gPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcclxuICAgICAgICB0aGlzLmlkZW50aXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWRlbnRpdHkoKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBjb3B5RnJvbShtYXQ6IG1hdDQpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm0uc2V0KG1hdC5tKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogIHgsICAwLCAgMCwgMFxyXG4gICAgICogIDAsICB5LCAgMCwgMFxyXG4gICAgICogIDAsICAwLCAgeiwgMFxyXG4gICAgICogdHgsIHR5LCB0eiwgMVxyXG4gICAgICovXHJcbiAgICBtdWx0aXBseShvdGhlcjogbWF0NCk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IGEgPSB0aGlzLm0sIGIgPSBvdGhlci5tO1xyXG4gICAgICAgIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7ICsraSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7ICsraikge1xyXG4gICAgICAgICAgICAgICAgb3V0W2ogKiA0ICsgaV0gPVxyXG4gICAgICAgICAgICAgICAgYVswICogNCArIGldICogYltqICogNCArIDBdICtcclxuICAgICAgICAgICAgICAgIGFbMSAqIDQgKyBpXSAqIGJbaiAqIDQgKyAxXSArXHJcbiAgICAgICAgICAgICAgICBhWzIgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMl0gK1xyXG4gICAgICAgICAgICAgICAgYVszICogNCArIGldICogYltqICogNCArIDNdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm0uc2V0KG91dCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQZXJzcGVjdGl2ZSBtYXRyaWNlLCB0aGUgZmFjdG9yIGlzIGNhbGN1bGF0ZWQgZnJvbSB0aGUgdGFuIG9mIHRoZSBGT1YgZGl2aWRlZCBieSAyOlxyXG4gICAgICogV2UgaGF2ZSB0aGUgbmVhciBwbGFuZSBhbmQgZmFyIHBsYW5lLiAob2JqZWN0cyBhcmUgZHJhd24gaW4tYmV0d2VlbilcclxuICAgICAqIGFzcGVjdCBpcyB0aGUgYXNwZWN0LXJhdGlvIGxpa2UgMTY6OSBvbiBtb3N0IHNjcmVlbnMuXHJcbiAgICAgKiBXZSBjaGFuZ2UgZWFjaCB2ZXJ0aWNlcyB4LCB5IGFuZCB6IGJ5IHRoZSBmb2xsb3dpbmc6XHJcbiAgICAgKiAwLCAwLCAgMCwgIDBcclxuICAgICAqIDAsIDUsICAwLCAgMFxyXG4gICAgICogMCwgMCwgMTAsIDExXHJcbiAgICAgKiAwLCAwLCAxNCwgMTVcclxuICAgICAqL1xyXG4gICAgc2V0UGVyc3BlY3RpdmUoZm92UmFkOiBudW1iZXIsIGFzcGVjdDogbnVtYmVyLCBuZWFyOiBudW1iZXIsIGZhcjogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgZiA9IDEuMCAvIE1hdGgudGFuKGZvdlJhZCAvIDIpO1xyXG4gICAgICAgIGNvbnN0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG5cclxuICAgICAgICBtWzBdID0gZiAvIGFzcGVjdDtcclxuICAgICAgICBtWzFdID0gMDtcclxuICAgICAgICBtWzJdID0gMDtcclxuICAgICAgICBtWzNdID0gMDtcclxuXHJcbiAgICAgICAgbVs0XSA9IDA7XHJcbiAgICAgICAgbVs1XSA9IGY7XHJcbiAgICAgICAgbVs2XSA9IDA7XHJcbiAgICAgICAgbVs3XSA9IDA7XHJcblxyXG4gICAgICAgIG1bOF0gPSAwO1xyXG4gICAgICAgIG1bOV0gPSAwO1xyXG4gICAgICAgIG1bMTBdID0gKGZhciArIG5lYXIpICogbmY7XHJcbiAgICAgICAgbVsxMV0gPSAtMTtcclxuXHJcbiAgICAgICAgbVsxMl0gPSAwO1xyXG4gICAgICAgIG1bMTNdID0gMDtcclxuICAgICAgICBtWzE0XSA9IDIgKiBmYXIgKiBuZWFyICogbmY7XHJcbiAgICAgICAgbVsxNV0gPSAwO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRMb29rQXQoZXllOiB2ZWMzLCBjZW50ZXI6IHZlYzMsIHVwOiB2ZWMzKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgeiA9IGV5ZS5zdWJ0cmFjdChjZW50ZXIpLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IHggPSB1cC5jcm9zcyh6KS5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCB5ID0gei5jcm9zcyh4KTtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG5cclxuICAgICAgICBtWzBdID0geC54O1xyXG4gICAgICAgIG1bMV0gPSB5Lng7XHJcbiAgICAgICAgbVsyXSA9IHoueDtcclxuICAgICAgICBtWzNdID0gMDtcclxuXHJcbiAgICAgICAgbVs0XSA9IHgueTtcclxuICAgICAgICBtWzVdID0geS55O1xyXG4gICAgICAgIG1bNl0gPSB6Lnk7XHJcbiAgICAgICAgbVs3XSA9IDA7XHJcblxyXG4gICAgICAgIG1bOF0gPSB4Lno7XHJcbiAgICAgICAgbVs5XSA9IHkuejtcclxuICAgICAgICBtWzEwXSA9IHouejtcclxuICAgICAgICBtWzExXSA9IDA7XHJcblxyXG4gICAgICAgIG1bMTJdID0gLXguZG90KGV5ZSk7XHJcbiAgICAgICAgbVsxM10gPSAteS5kb3QoZXllKTtcclxuICAgICAgICBtWzE0XSA9IC16LmRvdChleWUpO1xyXG4gICAgICAgIG1bMTVdID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShxOiBxdWF0LCB2OiB2ZWMzLCBzOiB2ZWMzKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgeCA9IHEueCwgeSA9IHEueSwgeiA9IHEueiwgdyA9IHEudztcclxuICAgICAgICBjb25zdCBzeCA9IHMueCwgc3kgPSBzLnksIHN6ID0gcy56O1xyXG5cclxuICAgICAgICBjb25zdCB4MiA9IHggKyB4LCB5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xyXG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XHJcbiAgICAgICAgY29uc3QgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcclxuICAgICAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xyXG5cclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG5cclxuICAgICAgICBtWzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XHJcbiAgICAgICAgbVsxXSA9ICh4eSArIHd6KSAqIHN4O1xyXG4gICAgICAgIG1bMl0gPSAoeHogLSB3eSkgKiBzeDtcclxuICAgICAgICBtWzNdID0gMDtcclxuXHJcbiAgICAgICAgbVs0XSA9ICh4eSAtIHd6KSAqIHN5O1xyXG4gICAgICAgIG1bNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcclxuICAgICAgICBtWzZdID0gKHl6ICsgd3gpICogc3k7XHJcbiAgICAgICAgbVs3XSA9IDA7XHJcblxyXG4gICAgICAgIG1bOF0gPSAoeHogKyB3eSkgKiBzejtcclxuICAgICAgICBtWzldID0gKHl6IC0gd3gpICogc3o7XHJcbiAgICAgICAgbVsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzejtcclxuICAgICAgICBtWzExXSA9IDA7XHJcblxyXG4gICAgICAgIG1bMTJdID0gdi54O1xyXG4gICAgICAgIG1bMTNdID0gdi55O1xyXG4gICAgICAgIG1bMTRdID0gdi56O1xyXG4gICAgICAgIG1bMTVdID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0iLCIvL1xyXG4vLyBGVU5DVElPTlxyXG4vL1xyXG5cclxuLy8gRGlzcGxheSBhbiBlcnJvciBtZXNzYWdlIHRvIHRoZSBIVE1MIEVsZW1lbnQgd2l0aCBpZCBcImVycm9yLWNvbnRhaW5lclwiLlxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVycm9yLWNvbnRhaW5lclwiKTtcclxuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gRWxlbWVudCB3aXRoIElEOiBlcnJvci1jb250YWluZXJcIik7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgZWxlbWVudC5pbm5lclRleHQgPSBtc2c7XHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xyXG59XHJcblxyXG4vLyBHZXQgc2hhZGVycyBzb3VyY2UgY29kZS5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNoYWRlclNvdXJjZSh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBsb2FkaW5nIHNoYWRlciBjb2RlIGF0IFwiJHt1cmx9XCI6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbn1cclxuXHJcbi8vIFJldHVybiB0aGUgV2ViR0wgQ29udGV4dCBmcm9tIHRoZSBDYW52YXMgRWxlbWVudC5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHQoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xyXG4gICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IDtcclxufVxyXG5cclxuLy8gQ29udmVydCBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFudC5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGFuZ2xlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGFuZ2xlICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIFdlYkdMIEJ1ZmZlciB0eXBlLiAoT3BhcXVlIEhhbmRsZSlcclxuICogLSBTVEFUSUNfRFJBVyA6IHdvbnQgdXBkYXRlIG9mdGVuLCBidXQgb2Z0ZW4gdXNlZC5cclxuICogLSBBUlJBWV9CVUZGRVIgOiBpbmRpY2F0ZSB0aGUgcGxhY2UgdG8gc3RvcmUgdGhlIEFycmF5LlxyXG4gKiAtIEVMRU1FTlRfQVJSQVlfQlVGRkVSIDogVXNlZCBmb3IgaW5kaWNlcyB3aXRoIGN1YmUgc2hhcGVzIGRyYXdpbmcuXHJcbiAqIEJpbmQgdGhlIEJ1ZmZlciB0byB0aGUgQ1BVLCBhZGQgdGhlIEFycmF5IHRvIHRoZSBCdWZmZXIgYW5kIENsZWFyIGFmdGVyIHVzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGF0aWNCdWZmZXIoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGRhdGE6IEFycmF5QnVmZmVyLCBpc0luZGljZTogYm9vbGVhbik6IFdlYkdMQnVmZmVyIHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgY29uc3QgdHlwZSA9IChpc0luZGljZSA9PSB0cnVlKSA/IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSIDogZ2wuQVJSQVlfQlVGRkVSXHJcbiAgICBpZighYnVmZmVyKSB7IFxyXG4gICAgICAgIHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBidWZmZXIgc3BhY2VcIik7IFxyXG4gICAgICAgIHJldHVybiAwOyBcclxuICAgIH1cclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIGJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgbnVsbCk7XHJcbiAgICByZXR1cm4gYnVmZmVyXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgdmVydGV4IGFycmF5IG9iamVjdCBidWZmZXJzLCBpdCByZWFkIHRoZSB2ZXJ0aWNlcyBmcm9tIEdQVSBCdWZmZXIuXHJcbiAqIFRoZSB2ZXJ0ZXggYnVmZmVyIGNvbnRhaW5zIHRoZSBjb29yZGluYXRlcyBhbmQgY29sb3IgcGVyIHZlcnRleC4gKHgsIHksIHosIHIsIGcsIGIpXHJcbiAqIFRoZSBpbmRleCBidWZmZXIgY29udGFpbnMgd2ljaCB2ZXJ0ZXggbmVlZCB0byBiZSBkcmF3biBvbiBzY2VuZSB0byBhdm9pZCBzdXJwbHVzLlxyXG4gKiBUaGUgY29sb3IgYXR0cmliIHBvaW50ZXIgaXMgb2Zmc2V0IGJ5IDMgZWFjaCB0aW1lIHRvIGF2b2lkICh4LCB5LCB6KS5cclxuICogVGhlIHZlcnRleCBzaGFkZXIgcGxhY2UgdGhlIHZlcnRpY2VzIGluIGNsaXAgc3BhY2UgYW5kIHRoZSBmcmFnbWVudCBzaGFkZXIgY29sb3IgdGhlIHBpeGVscy4gKERlZmF1bHQ6IDApXHJcbiAqIFZlcnRleEF0dHJpYlBvaW50ZXIgW0luZGV4LCBTaXplLCBUeXBlLCBJc05vcm1hbGl6ZWQsIFN0cmlkZSwgT2Zmc2V0XVxyXG4gKiAtIEluZGV4IChsb2NhdGlvbilcclxuICogLSBTaXplIChDb21wb25lbnQgcGVyIHZlY3RvcilcclxuICogLSBUeXBlXHJcbiAqIC0gSXNOb3JtYWxpemVkIChpbnQgdG8gZmxvYXRzLCBmb3IgY29sb3IgdHJhbnNmb3JtIFswLCAyNTVdIHRvIGZsb2F0IFswLCAxXSlcclxuICogLSBTdHJpZGUgKERpc3RhbmNlIGJldHdlZW4gZWFjaCB2ZXJ0ZXggaW4gdGhlIGJ1ZmZlcilcclxuICogLSBPZmZzZXQgKE51bWJlciBvZiBza2lwZWQgYnl0ZXMgYmVmb3JlIHJlYWRpbmcgYXR0cmlidXRlcylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWQU9CdWZmZXIoXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHZlcnRleEJ1ZmZlcjogV2ViR0xCdWZmZXIsIGluZGV4QnVmZmVyOiBXZWJHTEJ1ZmZlcixcclxuICAgIHBvc0F0dHJpYjogbnVtYmVyLCBjb2xvckF0dHJpYjogbnVtYmVyXHJcbik6IFdlYkdMVmVydGV4QXJyYXlPYmplY3Qge1xyXG4gICAgY29uc3QgdmFvID0gZ2wuY3JlYXRlVmVydGV4QXJyYXkoKTtcclxuICAgIGlmKCF2YW8pIHsgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGFsbG9jYXRlIFZBTyBidWZmZXIuXCIpOyByZXR1cm4gMDsgfVxyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KHZhbyk7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NBdHRyaWIpO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoY29sb3JBdHRyaWIpO1xyXG4gICAgLy8gSW50ZXJsZWF2ZWQgZm9ybWF0OiAoeCwgeSwgeiwgciwgZywgYikgKGFsbCBmMzIpXHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zQXR0cmliLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDYgKiBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQsIDApO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihjb2xvckF0dHJpYiwgMywgZ2wuRkxPQVQsIGZhbHNlLCA2ICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5ULCAzICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGV4QnVmZmVyKTtcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgcmV0dXJuIHZhbztcclxufVxyXG5cclxuLy8gQ3JlYXRlIGEgcHJvZ3JhbSBhbmQgbGluayB0aGUgdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlIGNvZGUgdG8gaXQuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtKFxyXG4gICAgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsXHJcbiAgICB2ZXJ0ZXhTaGFkZXJTcmM6IHN0cmluZyxcclxuICAgIGZyYWdtZW50U2hhZGVyU3JjOiBzdHJpbmdcclxuKTogV2ViR0xQcm9ncmFtIHtcclxuICAgIGNvbnN0IHZlcnRleFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcclxuICAgIGNvbnN0IGZyYWdtZW50U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XHJcbiAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG5cclxuICAgIGdsLnNoYWRlclNvdXJjZSh2ZXJ0ZXhTaGFkZXIsIHZlcnRleFNoYWRlclNyYyk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRleFNoYWRlcik7XHJcbiAgICBpZighZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHZlcnRleFNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKHZlcnRleFNoYWRlcik7XHJcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gc2hhZGVyIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2wuc2hhZGVyU291cmNlKGZyYWdtZW50U2hhZGVyLCBmcmFnbWVudFNoYWRlclNyYyk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdtZW50U2hhZGVyKTtcclxuICAgIGlmKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoZnJhZ21lbnRTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnbWVudFNoYWRlcik7XHJcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gc2hhZGVyIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJvZ3JhbSBzZXQgdXAgZm9yIFVuaWZvcm1zLlxyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleFNoYWRlcik7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICBpZighZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHByb2dyYW0gZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBwcm9ncmFtO1xyXG59IiwiLy8gVmVydGV4IGJ1ZmZlciBmb3JtYXQ6IFhZWiBSR0IgKGludGVybGVhdmVkKVxyXG5cclxuLy9cclxuLy8gQ3ViZSBnZW9tZXRyeVxyXG4vLyB0YWtlbiBmcm9tOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViR0xfQVBJL1R1dG9yaWFsL0NyZWF0aW5nXzNEX29iamVjdHNfdXNpbmdfV2ViR0xcclxuZXhwb3J0IGNvbnN0IENVQkVfVkVSVElDRVMgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAvLyBGcm9udCBmYWNlXHJcbiAgLTEuMCwgLTEuMCwgMS4wLCAxLCAwLCAwLCAgLy8gMFxyXG4gIDEuMCwgLTEuMCwgMS4wLCAxLCAwLCAwLCAgIC8vIDFcclxuICAxLjAsIDEuMCwgMS4wLCAxLCAwLCAwLCAgICAvLyAyXHJcbiAgLTEuMCwgMS4wLCAxLjAsIDEsIDAsIDAsICAgLy8gM1xyXG5cclxuICAvLyBCYWNrIGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAxLCAwLCAwLCAvLyA0XHJcbiAgLTEuMCwgMS4wLCAtMS4wLCAxLCAwLCAwLCAgLy8gNVxyXG4gIDEuMCwgMS4wLCAtMS4wLCAxLCAwLCAwLCAgIC8vIC4uLlxyXG4gIDEuMCwgLTEuMCwgLTEuMCwgMSwgMCwgMCxcclxuXHJcbiAgLy8gVG9wIGZhY2VcclxuICAtMS4wLCAxLjAsIC0xLjAsIDAsIDEsIDAsXHJcbiAgLTEuMCwgMS4wLCAxLjAsIDAsIDEsIDAsXHJcbiAgMS4wLCAxLjAsIDEuMCwgMCwgMSwgMCxcclxuICAxLjAsIDEuMCwgLTEuMCwgMCwgMSwgMCxcclxuXHJcbiAgLy8gQm90dG9tIGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAwLCAxLCAwLFxyXG4gIDEuMCwgLTEuMCwgLTEuMCwgMCwgMSwgMCxcclxuICAxLjAsIC0xLjAsIDEuMCwgMCwgMSwgMCxcclxuICAtMS4wLCAtMS4wLCAxLjAsIDAsIDEsIDAsXHJcblxyXG4gIC8vIFJpZ2h0IGZhY2VcclxuICAxLjAsIC0xLjAsIC0xLjAsIDAsIDAsIDEsXHJcbiAgMS4wLCAxLjAsIC0xLjAsIDAsIDAsIDEsXHJcbiAgMS4wLCAxLjAsIDEuMCwgMCwgMCwgMSxcclxuICAxLjAsIC0xLjAsIDEuMCwgMCwgMCwgMSxcclxuXHJcbiAgLy8gTGVmdCBmYWNlXHJcbiAgLTEuMCwgLTEuMCwgLTEuMCwgMCwgMCwgMSxcclxuICAtMS4wLCAtMS4wLCAxLjAsIDAsIDAsIDEsXHJcbiAgLTEuMCwgMS4wLCAxLjAsIDAsIDAsIDEsXHJcbiAgLTEuMCwgMS4wLCAtMS4wLCAwLCAwLCAxLFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBDVUJFX0lORElDRVMgPSBuZXcgVWludDE2QXJyYXkoW1xyXG4gIDAsIDEsIDIsXHJcbiAgMCwgMiwgMywgLy8gZnJvbnRcclxuICA0LCA1LCA2LFxyXG4gIDQsIDYsIDcsIC8vIGJhY2tcclxuICA4LCA5LCAxMCxcclxuICA4LCAxMCwgMTEsIC8vIHRvcFxyXG4gIDEyLCAxMywgMTQsXHJcbiAgMTIsIDE0LCAxNSwgLy8gYm90dG9tXHJcbiAgMTYsIDE3LCAxOCxcclxuICAxNiwgMTgsIDE5LCAvLyByaWdodFxyXG4gIDIwLCAyMSwgMjIsXHJcbiAgMjAsIDIyLCAyMywgLy8gbGVmdFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBUQUJMRV9WRVJUSUNFUyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gIC8vIFRvcCBmYWNlXHJcbiAgLTEwLjAsIDAuMCwgLTEwLjAsIDAuMiwgMC4yLCAwLjIsXHJcbiAgLTEwLjAsIDAuMCwgMTAuMCwgMC4yLCAwLjIsIDAuMixcclxuICAxMC4wLCAwLjAsIDEwLjAsIDAuMiwgMC4yLCAwLjIsXHJcbiAgMTAuMCwgMC4wLCAtMTAuMCwgMC4yLCAwLjIsIDAuMixcclxuXSk7XHJcblxyXG5leHBvcnQgY29uc3QgVEFCTEVfSU5ESUNFUyA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgMCwgMSwgMixcclxuICAwLCAyLCAzLCAvLyB0b3BcclxuXSk7IiwiaW1wb3J0ICogYXMgZm5jIGZyb20gXCIuL2Z1bmN0aW9uXCI7XHJcbmltcG9ydCAqIGFzIGNscyBmcm9tIFwiLi9jbGFzc1wiO1xyXG5pbXBvcnQgKiBhcyBnZW8gZnJvbSBcIi4vZ2VvbWV0cnlcIjtcclxuXHJcbi8vXHJcbi8vIE1BSU5cclxuLy9cclxuXHJcbi8vIERlbW8gTWFpbiBmbmN0aW9uLlxyXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xyXG5cclxuICAgIC8vIENhbnZhcyBFbGVtZW50IGFuZCBSZW5kZXJpbmcgQ29udGV4dC5cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ2wtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY29uc3QgZ2wgPSBmbmMuZ2V0Q29udGV4dChjYW52YXMpO1xyXG5cclxuICAgIC8vIEN1YmUgYW5kIFRhYmxlIHZlcnRleCBhbmQgaW5kaWNlcyBidWZmZXJzLlxyXG4gICAgY29uc3QgY3ViZVZlcnRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfVkVSVElDRVMsIGZhbHNlKTtcclxuICAgIGNvbnN0IGN1YmVJbmRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfSU5ESUNFUywgdHJ1ZSk7XHJcbiAgICBjb25zdCB0YWJsZVZlcnRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLlRBQkxFX1ZFUlRJQ0VTLCBmYWxzZSk7XHJcbiAgICBjb25zdCB0YWJsZUluZGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uVEFCTEVfSU5ESUNFUywgdHJ1ZSk7XHJcblxyXG4gICAgaWYgKCFjdWJlVmVydGljZXMgfHwgIWN1YmVJbmRpY2VzIHx8ICF0YWJsZVZlcnRpY2VzIHx8ICF0YWJsZUluZGljZXMpIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gY3JlYXRlIGdlbzogY3ViZTogKHY9JHshIWN1YmVWZXJ0aWNlc30gaT0ke2N1YmVJbmRpY2VzfSksIHRhYmxlPSh2PSR7ISF0YWJsZVZlcnRpY2VzfSBpPSR7ISF0YWJsZUluZGljZXN9KWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaGFkZXJzIHNvdXJjZSBjb2RlIGluIHN0cmluZyBmb3JtYXQgYW5kIGxpbmsgdGhlbSB0byBhIHByb2dyYW0uXHJcbiAgICBjb25zdCB2ZXJ0ZXhTcmMgPSBhd2FpdCBmbmMuZ2V0U2hhZGVyU291cmNlKCcuL3NoYWRlcnMvdmVydGV4X3NoYWRlci52ZXJ0Jyk7XHJcbiAgICBjb25zdCBmcmFnbWVudFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy9mcmFnbWVudF9zaGFkZXIuZnJhZycpO1xyXG4gICAgY29uc3QgcHJvZ3JhbSA9IGZuYy5jcmVhdGVQcm9ncmFtKGdsLCB2ZXJ0ZXhTcmMsIGZyYWdtZW50U3JjKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIGJ1aWx0LWluIHZhcmlhYmxlcyBmcm9tIHNoYWRlcnMsIGFuZCBnZXQgdGhlIHVuaWZvcm1zIHZhcmlhYmxlIHNldCBieSB0aGUgdXNlci5cclxuICAgIGNvbnN0IHBvc2l0aW9uQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleFBvc2l0aW9uJyk7XHJcbiAgICBjb25zdCBjb2xvckF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICd2ZXJ0ZXhDb2xvcicpO1xyXG4gICAgY29uc3QgbWF0V29ybGRVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRXb3JsZCcpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG4gICAgY29uc3QgbWF0Vmlld1Byb2pVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRWaWV3UHJvaicpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG5cclxuICAgIGlmKHBvc2l0aW9uQXR0cmlidXRlIDwgMCB8fCBjb2xvckF0dHJpYnV0ZSA8IDAgfHwgIW1hdFdvcmxkVW5pZm9ybSB8fCAhbWF0Vmlld1Byb2pVbmlmb3JtKSB7XHJcbiAgICAgICAgZm5jLnNob3dFcnJvcihgRmFpbGVkIHRvIGdldCBhdHRyaWJzL3VuaWZvcm1zOiBgICtcclxuICAgICAgICAgICAgIGBwb3M9JHtwb3NpdGlvbkF0dHJpYnV0ZX0sIGNvbG9yPSR7Y29sb3JBdHRyaWJ1dGV9IGAgK1xyXG4gICAgICAgICAgICBgbWF0V29ybGQ9JHshIW1hdFdvcmxkVW5pZm9ybX0gbWF0Vmlld1Byb2o9JHshIW1hdFZpZXdQcm9qVW5pZm9ybX1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHZlcnRleCBhcnJheSBvYmplY3QgYnVmZmVycy5cclxuICAgIGNvbnN0IGN1YmVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCBjdWJlVmVydGljZXMsIGN1YmVJbmRpY2VzLCBwb3NpdGlvbkF0dHJpYnV0ZSwgY29sb3JBdHRyaWJ1dGUpO1xyXG4gICAgY29uc3QgdGFibGVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCB0YWJsZVZlcnRpY2VzLCB0YWJsZUluZGljZXMsIHBvc2l0aW9uQXR0cmlidXRlLCBjb2xvckF0dHJpYnV0ZSk7XHJcbiAgICBpZighY3ViZVZBTyB8fCAhdGFibGVWQU8pIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZXMgdG8gY3JlYXRlIFZBT3M6IGN1YmU9JHshIWN1YmVWQU99LCB0YWJsZT0keyEhdGFibGVWQU99YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBlbXB0eSBhcnJheSB0byBzdG9yZSBvdXIgY3ViZXMuXHJcbiAgICBjb25zdCBVUF9WRUMgPSBuZXcgY2xzLnZlYzMoMCwgMSwgMCk7XHJcbiAgICBjb25zdCBjdWJlcyA9IFtcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygwLCAwLCAwKSwgMSwgVVBfVkVDLCAwLCB0YWJsZVZBTywgZ2VvLlRBQkxFX0lORElDRVMubGVuZ3RoKSwgICAvLyBHcm91bmRcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygwLCAwLjQsIDApLCAwLjQsIFVQX1ZFQywgMCwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLCAvLyBDZW50ZXJcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygxLCAwLjA1LCAxKSwgMC4wNSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oMjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoMSwgMC4xLCAtMSksIDAuMSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNDApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoLTEsIDAuMTUsIDEpLCAwLjE1LCBVUF9WRUMsIGZuYy50b1JhZGlhbig2MCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygtMSwgMC4yLCAtMSksIDAuMiwgVVBfVkVDLCBmbmMudG9SYWRpYW4oODApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICBdO1xyXG5cclxuICAgIGxldCBtYXRWaWV3ID0gbmV3IGNscy5tYXQ0KCk7XHJcbiAgICBsZXQgbWF0UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xyXG4gICAgbGV0IG1hdFZpZXdQcm9qID0gbmV3IGNscy5tYXQ0KCk7XHJcblxyXG4gICAgbGV0IGNhbWVyYUFuZ2xlID0gMDtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgZm5jdGlvbiB0byBjYWxsIGl0IGVhY2ggZnJhbWUuXHJcbiAgICAgKiAtIE91dHB1dCBNZXJnZXI6IE1lcmdlIHRoZSBzaGFkZWQgcGl4ZWwgZnJhZ21lbnQgd2l0aCB0aGUgZXhpc3Rpbmcgb3V0IGltYWdlLlxyXG4gICAgICogLSBSYXN0ZXJpemVyOiBXaWNoIHBpeGVsIGFyZSBwYXJ0IG9mIHRoZSBWZXJ0aWNlcyArIFdpY2ggcGFydCBpcyBtb2RpZmllZCBieSBPcGVuR0wuXHJcbiAgICAgKiAtIEdQVSBQcm9ncmFtOiBQYWlyIFZlcnRleCAmIEZyYWdtZW50IHNoYWRlcnMuXHJcbiAgICAgKiAtIFVuaWZvcm1zOiBTZXR0aW5nIHRoZW0gKGNhbiBiZSBzZXQgYW55d2hlcmUpIChzaXplL2xvYyBpbiBwaXhlbHMgKHB4KSlcclxuICAgICAqIC0gRHJhdyBDYWxsczogKHcvIFByaW1pdGl2ZSBhc3NlbWJseSArIGZvciBsb29wKVxyXG4gICAgICovXHJcbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgY29uc3QgZnJhbWUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBkdCB3aXRoIHRpbWUgaW4gc2Vjb25kcyBiZXR3ZWVuIGVhY2ggZnJhbWUuXHJcbiAgICAgICAgY29uc3QgdGhpc0ZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIGNvbnN0IGR0ID0gKHRoaXNGcmFtZVRpbWUgLSBsYXN0RnJhbWVUaW1lKSAvIDEwMDA7XHJcbiAgICAgICAgbGFzdEZyYW1lVGltZSA9IHRoaXNGcmFtZVRpbWU7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZVxyXG4gICAgICAgIGNhbWVyYUFuZ2xlICs9IGR0ICogZm5jLnRvUmFkaWFuKDEwKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2FtZXJhWCA9IDMgKiBNYXRoLnNpbihjYW1lcmFBbmdsZSk7XHJcbiAgICAgICAgY29uc3QgY2FtZXJhWiA9IDMgKiBNYXRoLmNvcyhjYW1lcmFBbmdsZSk7XHJcblxyXG4gICAgICAgIG1hdFZpZXcuc2V0TG9va0F0KFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoY2FtZXJhWCwgMSwgY2FtZXJhWiksXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAwLCAwKSxcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDEsIDApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBtYXRQcm9qLnNldFBlcnNwZWN0aXZlKFxyXG4gICAgICAgICAgICBmbmMudG9SYWRpYW4oODApLCAvLyBGT1ZcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCwgLy8gQVNQRUNUIFJBVElPXHJcbiAgICAgICAgICAgIDAuMSwgMTAwLjAgLy8gWi1ORUFSIC8gWi1GQVJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBpbiBHTE06IG1hdFZpZXdQcm9qID0gbWF0UHJvaiAqIG1hdFZpZXdcclxuICAgICAgICBtYXRWaWV3UHJvaiA9IG1hdFByb2oubXVsdGlwbHkobWF0Vmlldyk7XHJcblxyXG4gICAgICAgIC8vIFJlbmRlclxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCAqIGRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG5cclxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMDIsIDAuMDIsIDAuMDIsIDEpO1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XHJcbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNDVyk7XHJcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFZpZXdQcm9qVW5pZm9ybSwgZmFsc2UsIG1hdFZpZXdQcm9qLm0pO1xyXG5cclxuICAgICAgICBjdWJlcy5mb3JFYWNoKChjdWJlKSA9PiBjdWJlLmRyYXcoZ2wsIG1hdFdvcmxkVW5pZm9ybSkpO1xyXG4gICAgICAgIC8vIExvb3AgY2FsbHMsIGVhY2ggdGltZSB0aGUgZHJhd2luZyBpcyByZWFkeS5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gICAgfTtcclxuICAgIC8vIEZpcnN0IGNhbGwsIGFzIHNvb24sIGFzIHRoZSBicm93c2VyIGlzIHJlYWR5LlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxufVxyXG5cclxuZm5jLnNob3dFcnJvcihcIk5vIEVycm9ycyEg8J+MnlwiKTtcclxuXHJcbnRyeSB7IG1haW4oKTsgfSBjYXRjaChlKSB7IGZuYy5zaG93RXJyb3IoYFVuY2F1Z2h0IGV4Y2VwdGlvbjogJHtlfWApOyB9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL21haW4udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=