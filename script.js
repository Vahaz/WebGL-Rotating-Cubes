"use strict";
function showError(msg) {
    const container = document.getElementById("error-container");
    if (container === null)
        return console.log("No Element with ID: error-container");
    const element = document.createElement('p');
    element.innerText = msg;
    container.appendChild(element);
    console.log(msg);
}
function createStaticVertexBuffer(gl, data) {
    const buffer = gl.createBuffer(); // Create a WebGL Buffer type. (Opaque Handle)
    if (!buffer) {
        showError("Failed to allocate buffer space");
        return null;
    }
    // STATIC_DRAW → Wont update often, but often used.
    // ARRAY_BUFFER → Indicate the place to store the Array.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Attach the Buffer to the CPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); // Add Array to the Buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // Clear after use.
    return buffer;
}
// 4. Input assembler → Read Vertices from GPU Buffer.
// Tell OpenGL the data type sent (Float, Array, etc)
function createTwoBufferVao(gl, positionBuffer, colorBuffer, positionAttribute, colorAttribute) {
    const vao = gl.createVertexArray();
    if (!vao) {
        showError("Failed to allocate VAO buffer.");
        return null;
    }
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttribute); // Vertex Shader → Place Vertices in clip space.
    gl.enableVertexAttribArray(colorAttribute); // Fragment Shader → Color the pixels.
    // If not present: OpenGL uses default 0 everywhere.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribute, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    // VertexAttribPointer
    // - Index (location)
    // - Size (Component per vector)
    // - Type
    // - Normalized? (int to floats, for color transform [0, 255] to float [0, 1])
    // - Stride (Distance between each vertex in the buffer)
    // - Offset (Number of skiped bytes before reading attributes)
    // Clear after use
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return vao;
}
// [Top-x, Top-y, Left-x, Left-y, Right-x, Right-y]
// JS uses 64bit Arrays, and CPU prefer 32bits for half numbers.
const triangleVertices = new Float32Array([0, 1, -1, -1, 1, -1]);
// Colors !
const rgbTriangleColors = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255
]);
const gradientTriangleColors = new Uint8Array([
    229, 47, 15,
    246, 206, 29,
    233, 154, 26
]);
// Shader code, need to be placed here to be compiled and used by the GPU.
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
// " `#version 300 es " : in this order is mandatory!
// gl_Position = vec4(x, y, z-sorting [-1;1], w) [built-in]
// x, y and z are devided by w.
// Take the canvasSize to devide the finalPosition.
// The finalPosition: vertexPosition * size + location.
// to make sure they are in range, we / the finalPos by the canvasSizes
// ClipPosition is a %, so we need to make it in range from -1 to 1 by adding (*2 - 1)
// We input a color to the fragment color to pass the color along the shaders.
const fragmentShaderCode = `#version 300 es
precision mediump float;

in vec3 fragmentColor;
out vec4 outputColor;

void main() {
    outputColor = vec4(fragmentColor, 1.0);
}
`;
// We need to specify here the variables, no built-in inputs.
// We get the fragmentColor from the vertexShader
function main() {
    // Get the canvas
    const canvas = document.getElementById("webgl-canvas");
    if (!canvas || !(canvas instanceof HTMLCanvasElement))
        return showError("No Element with ID: #webgl-canvas");
    // Get the WebGL2 context
    const gl = canvas.getContext("webgl2");
    if (!gl || gl === null)
        return showError("WebGL is not initialize.");
    // Create vertex buffers
    const triangleGeoBuffer = createStaticVertexBuffer(gl, triangleVertices);
    const rgbGeoBuffer = createStaticVertexBuffer(gl, rgbTriangleColors);
    const gradientGeoBuffer = createStaticVertexBuffer(gl, gradientTriangleColors);
    if (!triangleGeoBuffer || !rgbGeoBuffer || !gradientGeoBuffer)
        return showError("Failed to create vertex buffers.");
    // Setup the vertex shader.
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (vertexShader === null)
        return showError("No GPU Memory to allocate for Vertex Shader.");
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        return showError(error || "No shader debug log provided.");
    }
    // Setup the fragment shader.
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader === null)
        return showError("No GPU Memory to allocate for Fragment Shader.");
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        return showError(error || "No shader debug log provided.");
    }
    // Required for uniforms.
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        return showError(error || "No program debug log provided.");
    }
    // Get the uniforms from shaders.
    const vertexPositionAttribute = gl.getAttribLocation(program, 'vertexPosition');
    const vertexColorAttribute = gl.getAttribLocation(program, 'vertexColor');
    if (vertexPositionAttribute < 0 || vertexColorAttribute < 0)
        return showError("Failed to get Attribute Location for vertexPosition.");
    // We create our Vertex Shader Uniforms variables.
    const locationUniform = gl.getUniformLocation(program, 'location');
    const sizeUniform = gl.getUniformLocation(program, 'size');
    const canvasSizeUniform = gl.getUniformLocation(program, 'canvasSize');
    if (locationUniform === null || sizeUniform === null || canvasSizeUniform === null)
        return showError("Empty Uniforms..");
    // Create buffers vao
    const rgbTriangleVAO = createTwoBufferVao(gl, triangleGeoBuffer, rgbGeoBuffer, vertexPositionAttribute, vertexColorAttribute);
    const gradientTriangleVAO = createTwoBufferVao(gl, triangleGeoBuffer, gradientGeoBuffer, vertexPositionAttribute, vertexColorAttribute);
    if (!rgbTriangleVAO || !gradientTriangleVAO) {
        showError(`Failes to create VAOs: 
            - rgbTriangle=${!!rgbTriangleVAO}
            - gradientTriangle=${!!gradientTriangleVAO}`);
        return null;
    }
    // 1. Output Merger → Merge the shaded pixel fragment with the existing out image.
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // 2. Rasterizer → Wich pixel are part of the Vertices.
    gl.viewport(0, 0, canvas.width, canvas.height); // Wich part is modified by OpenGL.
    // 3. GPU Program → Pair Vertex & Fragment shaders.
    gl.useProgram(program);
    // 4 Setting our Uniforms (can be set anywhere)
    gl.uniform2f(canvasSizeUniform, canvas.width, canvas.height);
    // 5. Draws Calls (also config primitive assembly)
    // First Triangle
    gl.uniform1f(sizeUniform, 200); // size in pixels.
    gl.uniform2f(locationUniform, canvas.width / 2, canvas.height / 2); // location in pixels.
    gl.bindVertexArray(rgbTriangleVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Second Triangle
    gl.uniform1f(sizeUniform, 100); // size in pixels.
    gl.uniform2f(locationUniform, canvas.width / 1.5, canvas.height / 1.5); // location in pixels.
    gl.bindVertexArray(gradientTriangleVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
showError("No Errors! 🌞");
try {
    main();
}
catch (e) {
    showError(`Uncaught exception: ${e}`);
}
