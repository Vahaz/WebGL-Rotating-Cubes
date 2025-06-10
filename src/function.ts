//
// FUNCTION
//

// Display an error message to the HTML Element with id "error-container".
export function showError(msg: string): void {
    const container = document.getElementById("error-container");
    if(container === null) return console.log("No Element with ID: error-container");
    const element = document.createElement('p');
    element.innerText = msg;
    container.appendChild(element);
    console.log(msg);
}

// Get a random number between two numbers.
export function getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// Get shaders source code.
export async function getShaderSource(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error while loading shader code at "${url}": ${response.statusText}`);
    }
    return response.text();
}

/**
 * - Create a WebGL Buffer type. (Opaque Handle)
 *   - STATIC_DRAW means we wont update often, but often used.
 *   - ARRAY_BUFFER on the other side indicate the place to store the Array.
 * - First, we attach the Buffer to the CPU.
 * - Add Array to the Buffer.
 * - Clear after use and return the buffer.
 */
export function createStaticVertexBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer): WebGLBuffer {
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

// Return the WebGL Context from the Canvas Element.
export function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
    return canvas.getContext('webgl2');
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
export function createTwoBufferVao(
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