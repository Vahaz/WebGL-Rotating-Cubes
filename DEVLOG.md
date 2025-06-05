

## DEV LOG #0 (before to 29/05/2025)

What I Learned :
1. CPU as hard time working on multi-tasking, why the existance of GPU.
2. Different Graphics APIs. (*OpenGL, DirectX or Vulkan..*)
3. OpenGL as WebGL, allow JS to communicate w/ Graphic API.
4. Vertices → Vertex Shader → Rasterizer → Fragment Shader → Final Output
5. Shaders are "GPU" code, while JS -*or others*- are "CPU" code.

Process:
1. Get the HTML tag "canvas" and request a WebGL2 context.
2. We create "Buffer". (*place in memory*)
    1. Bind it to an Array with static data.
3. We create "Vertex Shader", bind it the source code & compile it.
4. We create "Fragment Shader", bind it the source code & compile it.
5. We create "Program" and link the compiled shaders to it.
6. Retrieve the data from shader code "in". (*Vertex position & color*)
7. Retrieve the data from shader uniforms. (*location, size & canvas*)
8. Create Array, bind it and enable the Vertex position & color attributes.
    1. Specify the size, type of data and parameters of the attributes.
9. Clear the canvas
10. Set the viewport for the Rasterizer
11. Set the Program in use
12. Set the uniforms data, bind the 8. array and draw the vertices.

## DEV LOG #1 (30/05/2025)

[Now, we want and animation](https://youtu.be/lLa6XkVLj0w)

1. Move step 9 to 12 (*Canvas widht/height, Clearing the canvas..*) into it own function "frame".
    1.  Allow to call it multiple times. (*Thanks to a built-in js function <code>requestAnimationFrame</code>*)
2. Create a class "MovingShape" to generate our shape easily.
    1. The class takes a Position [x,y], Velocity [pixels,seconds], Size [number] and VAO [VertexArray].
    2. The class has a "update" function, with "dt" (*delta time*) argument.
    3. Delta represent the "mouvement" of the time and not just the time at a given time.
    4. "Update" update the position by adding: <code>position = ((position + velocity) * dt)</code>
3. Delta Time is calculated with two JS function <code>performance.now()</code>.
    1. <code>performance.now()</code> represent the time spent between last frame and now.
    2. We substract the <code>lastFrame</code> from the actual time spent on <code>thisFrame</code> to track delta time.
4. We replace the static draw calls, uniforms and updates to <code>.forEach()</code> loop.
    1. This allow us to create easily more triangles/objects.
    2. To do this, we create an array based on the class: <code>let shapes: MovingShape[] = [];</code>
5. Create a small <code>getRandom</code> to get random numbers between min / max.
6. Added constants at the beginning. (Spawn rate, shape limit, speed, size and time)
7. Added a <code>timeRemaining</code> and <code>isAlive()</code> in the constructor class <code>MovingShape</code>
8. Changed the <code>update</code> method to add the <code>timeRemaining</code> and removing <code>dt</code> from it.
9. Updating <code>timeToNextSpawn = timeToNextSpawn - dt</code>
10. While <code>timeToNextSpawn</code> is at 0, add SPAWN_RATE to itself.
    1. This means we need to spawn a shape!
    2. Get the angle from a random number between 0 and PI*2.
    3. Get the speed from a random number between min/max speed.
    4. The position is the middle of the canvas.
    5. The velocity is trigonometry from sin and cos of the angle times the speed.
    6. The size is a random from min / max sizes.
    7. TimeRemaining is retrieve from a random time between min and max life span.
    8. VAO is a random between 0 and 1 to choose the final color. (half rgb, half gradient)
    9. shape is the final construct, then it is pushed to the table.
11. We filter the shapes table by all active shapes and slice from 0 to SHAPE_COUNT_MAX.

## DEV LOG #2 (31/05/2025)

1. Added a <code>getShaderSource</code> function with Await/Promise to fetch the source code files and get the response to text (string).

What I Learned :
- I wanted to add annotations <code>/** @type {string} fruit_name */</code>, but apparently this is for JS Doc not TypeScript annotations. So I switched to this form of annotations <code>const fruit_name: string = "Apple"</code>.

What I did:
- I changed the annotations and read more about them and how they interact with JS/TS (thanks ThePrimeTime [for this video](https://www.youtube.com/watch?v=xJQ0qXh1-m0))
- Transfered the shaders code into separate files. Thx to ChatGPT, he helpt me with loading the shaders files (with a simple fetch... that I could found myself, but I though it would have been a better solution...)

Had to move out the documentation on shaders here:

<code>

- " #version 300 es " is mandatory (GLSL Embedded Systems 3.0).
- gl_Position = vec4(x, y, z-sorting [-1;1], w) [built-in]
    - x, y and z are devided by w.
- canvasSize is divided by finalPosition = vertexPosition * size + location
    - to make sure they are in range, we divide the finalPos by the canvasSize
- ClipPosition is a %, so we need to make it in range from -1 to 1 by adding (*2 - 1)
- We input a color to the fragment color to pass the color along the shaders.
- Fragment Shaders do not have built-in variables.
- We get the fragmentColor from the vertexShader.

</code>

## DEV LOG #3 (05/06/2025)

What I Learned :

### Matrices: Translation Matrix
- [
    - 1 0 0 0
    - 0 1 0 0
    - 0 0 1 0
   -  0 0 0 1
- ] * [x y z 1]

This equal to:

- [
    - x 0 0 tx
    - 0 y 0 ty
    - 0 0 z tz
    - 0 0 0 1
- ]

It is the same as doing:

- [
    - (1 * x) (0 * y) (0 * z) (tx * 1)
    - (0 * x) (1 * y) (0 * z) (ty * 1)
    - (0 * x) (0 * y) (1 * z) (tz * 1)
    - (0 * x) (0 * y) (0 * z) (1 * 1)
- ]

This equal to a vec4:

- [
    - x + tx
    - y + ty
    - z + tz
    - 1
- ]

The "1" is also called "w". 
The "1" is needed to have a collum to change tx, ty and tz. Without it, we can change x, y or z.

### Multiply Matrices

[1 2 3 4] * [5 6 7 8]

This equal to:

- [
    - (1 * 5) + (2 * 7) | (1 * 6) + (2 * 8)
    - (3 * 5) + (4 * 7) | (3 * 6) + (4 * 8)
- ]

It result to: [19 22 43 50]

To transform the calculation done to text: 
- top left * top left, top right * bottom left.
- top left * top right, top right * bottom right.
- bottom left * top left, bottom right * bottom left.
- bottom left * top right, bottom right * bottom right

Also can be:

[a b c d] * [w x y z]

- [
    - aw + by | ax + bz
    - cw + dy | cx + dz
- ]

See a pattern : 'abcd' 'abcd' on all sides and two times 'ww', 'yy', 'xx' and 'zz'.