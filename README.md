
Tutorial by Indigo Code: https://www.youtube.com/watch?v=y2UsQB3WSvo

package:
 - NodeJS v23.11.0
 - https-localhost v4.7.1
 - typescript v5.8.3

extensions:
 - glsl-canvas v0.2.15 by circledev (Live WebGL preview of GLSL shaders)
 - Live Preview v0.4.15 by Microsoft (Hosts a local server in your workspace for you to preview your webpages on.)
 - WebGL GLSL Editor v1.3.8 by Rácz Zalán (Language support for WebGL GLSL shaders.)
 - WebGL Syntax Hint v0.0.2 by nieyuyao (webgl plugin syntax)

usages:
 - glsl-canvas : "Show glslCanvas" command
 - WebGL GLSL Editor : edit and compile shaders
 - WebGl Syntax Hint : autocomplete


## DEV LOG #0

What I Learned :
1. CPU as hard time working on multi-tasking, why the existance of GPU.
2. Different Graphics APIs. (OpenGL, DirectX or Vulkan..)
3. OpenGL as WebGL, allow JS to communicate w/ Graphic API.
4. Vertices → Vertex Shader → Rasterizer → Fragment Shader → Final Output
5. Shaders are "GPU" code, while JS (or others) are "CPU" code.

Process:
1. Get the HTML tag "canvas" and request a WebGL2 context.
2. We create "Buffer". (place in memory)
2.5 Bind it to an Array with static data.
3. We create "Vertex Shader", bind it the source code & compile it.
4. We create "Fragment Shader", bind it the source code & compile it.
5. We create "Program" and link the compiled shaders to it.
6. Retrieve the data from shader code "in". (Vertex position & color)
7. Retrieve the data from shader uniforms. (location, size & canvas)
8. Create Array, bind it and enable the Vertex position & color attributes.
8.5 Specify the size, type of data and parameters of the attributes.
9. Clear the canvas
10. Set the viewport for the Rasterizer
11. Set the Program in use
12. Set the uniforms data, bind the 8. array and draw the vertices.

## DEV LOG #1

Now, we want and animation (https://youtu.be/lLa6XkVLj0w)

So, we move the 9 to 12 (Canvas widht/height, Clearing the canvas, etc) into it own function.
This allow us to call it multiple times. (Thanks to a built-in js function)