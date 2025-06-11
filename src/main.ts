import * as fnc from "./function";
import * as cls from "./class";
import * as geo from "./geometry";

//
// MAIN
//

// Demo Main fnction.
async function main(): Promise<void> {

    // Canvas Element and Rendering Context.
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
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
    const vertexSrc = await fnc.getShaderSource('shaders/vertex_shader.vert');
    const fragmentSrc = await fnc.getShaderSource('shaders/fragment_shader.frag');
    const program = fnc.createProgram(gl, vertexSrc, fragmentSrc);

    // Get the built-in variables from shaders, and get the uniforms variable set by the user.
    const positionAttribute = gl.getAttribLocation(program, 'vertexPosition');
    const colorAttribute = gl.getAttribLocation(program, 'vertexColor');
    const matWorldUniform = gl.getUniformLocation(program, 'matWorld') as WebGLUniformLocation;
    const matViewProjUniform = gl.getUniformLocation(program, 'matView') as WebGLUniformLocation;

    if(positionAttribute < 0 || colorAttribute < 0) {
        fnc.showError("Failed to get Attribute Location for vertexPosition.");
        return;
    }

    // Create vertex array object buffers.
    const cubeVAO = fnc.createVAOBuffer(gl, cubeVertices, cubeIndices, positionAttribute, colorAttribute);
    const tableVAO = fnc.createVAOBuffer(gl, tableVertices, tableIndices, positionAttribute, colorAttribute);
    if(!cubeVAO || !tableVAO) {
        fnc.showError(`Failes to create VAOs: cube=${!!cubeVAO}, table=${!!tableVAO}`);
        return;
    }

    // Create an empty array to store our cubes.
    const UP_VEC = new cls.Vec3(0, 1, 0);
    const cubes = [
        new cls.Shape(new cls.Vec3(0, 0, 0), 1, UP_VEC, 0, tableVAO, geo.TABLE_INDICES.length),   // Ground
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
    const frame = function(){
        // Calculate dt with time in seconds between each frame.
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;

        // Update
        cameraAngle += dt * fnc.toRadian(10);

        const cameraX = 3 * Math.sin(cameraAngle);
        const cameraZ = 3 * Math.cos(cameraAngle);

        matView.setLookAt(
            new cls.Vec3(cameraX, 1, cameraZ),
            new cls.Vec3(0, 0, 0),
            new cls.Vec3(0, 1, 0)
        );
        matProj.setPerspective(
            fnc.toRadian(80), // FOV
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
}

fnc.showError("No Errors! 🌞");

try { main(); } catch(e) { fnc.showError(`Uncaught exception: ${e}`); }