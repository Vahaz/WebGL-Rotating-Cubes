# Development logs [rewrite]

> [!NOTE]  
> This file is a rewrite of the [old devlog](old-DEVLOG.md). Nothing comes from me really, this is just a devlog on what I did while following tutorials.

> [!TIP]  
> If you are reading this, do not hesitate to check the [README](README.md) file, it contains Youtube tutorials and useful links.

## LOG #0 (~29/05/2025)

GPU is more powerful at multi-tasking. Different Graphics APIs allow us to speak with the GPU (*OpenGL, WebGL, DirextX, Vulkan, etc*). Here, we are using WebGL and TypeScript. Shaders are considered as "GPU code", while TypeScript/JS is "CPU code".

The process to display something on screen goes by:  
- **Vertices**
- **Vertex shader**: Vertices location, and receive/send Color to the fragment shader.
- **Rasterize**: Which pixel is in the boundaries of the vertices.
- **Fragment shader**: Place the color.
- **Final display**

To start, we need an index.html and main.js files to display our results, using the `<canvas>` HTML tag. In the main.js file, we `getElementById` and request a WebGL2 context. After allowing place in memory using a `buffer`, we bind it to a static array.  

The vertex and fragment shader are write, compile, and bind. To communicate with the shaders, we create a `program` and link the shaders to it. Using the attributes `in` in the vertex shader, we retrieve and link the vertex position and color. Attributes have a limit of 16 per program. `Uniforms` goes in vertex/fragment shaders, here for: location, size and canvas width and height) using `getAttribLocation` and `getUniformLocation`. `vertexAttribPointer` is used to set the position and color attributes, we set their size, type (Float? Int?), normalize (allowing int to be between 0 and 1, or -1 and 1), stride (bytes distance between each vertices) and offset (number of skipped bytes).  

After all this, we can clear the canvas, set the viewport for the rasterizer, set the program, and set the uniforms and draw the vertices.

## LOG #1 (30/05/2025)

> [!IMPORTANT]  
> You can follow this LOG with this video : [[02] WebGL Tutorial - Movement and Color](https://youtu.be/lLa6XkVLj0w)

To add animation/movement we add a `frame` function, called for each frame using a function named `requestAnimationFrame`.  

A `MovingShape` class is created to generate your shapes with position, velocity, size, and vertex array (VAO). Vertex Array Objects (VAO) are used to create, update, and store a snapshot of vertex attribute settings, saving us from recreating the same settings for each draw calls ([source](https://youtu.be/R2Y6vb3z_Hw)). Shapes are updated using an `update` method, with timeRemaining as its argument. An array is made to store the shapes created with a for each loop. Constants are written to manage the shapes like spawn rate, limit, speed, size, and lifespan. 

## LOG #1, #2, #3, and #4 (30/05/2025 → 09/06/2025)

> [!NOTE]  
> This LOG is merged with another one.

With help of ChatGPT, a `getShaderSource` function is added to fetch the shaders source code in separate files. ([vertex shader](/shaders/vertex_shader.vert) / [fragment shader](/shaders/fragment_shader.frag))  

> [!WARNING]  
> With help from ChatGPT, I added all the logic for matrices, vectors, and quat to understand them. It is ok not to do so, and use librairies like [glMatrix](https://glmatrix.net/).

> [!NOTE]  
> If you want to understand Matrices, I followed videos from **pikuma** on Youtube like ["Math for Game Developers: Why do we use 4x4 Matrices in 3D Graphics?"](https://youtu.be/Do_vEjd6gF0), ["Matrix Multiplication (A Simple Review)"](https://youtu.be/UG530eh8q4A), and [Perspective Projection Matrix (Math for Game Developers)](https://youtu.be/EqNcqBdrNyI)

## LOG #5, and #6 (10/06/2025 → 15/06/2025)

> [!NOTE]  
> You can follow the LOGs with this video, and series of video : [[03] WebGL Tutorial - Intro to 3D](https://youtu.be/_GSCxcmJ06A), and [WebGL 2.0 by Andrew Adamson](https://youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

Added a [geometry.ts](/src/geometry.ts) file, containing the vertices, indices location, and colors rgb. Changed the `createVAOBuffer` from triangle to create squares, it needed to have indices and `ELEMENT_ARRAY_BUFFER`. This allows to avoid duplicates vertices when drawing your 3D squares.

## LOG #7 (20/06/2025 → 21/06/2025)

Added the [UNLICENSE](LICENCE) license, because most of the works here came from videos and little ChatGPT, planning to switch to C++. Refactoring the [devlog](DEVLOG.md) file.