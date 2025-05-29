
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

What I Learned :
1. CPU as hard time working on multi-tasking, why the existance of GPU.
2. Different Graphics APIs. (OpenGL, DirectX or Vulkan..)
3. OpenGL as WebGL, allow JS to communicate w/ Graphic API.
4. Vertices → Vertex Shader → Rasterizer → Fragment Shader → Final Output
5. Shaders are "GPU" code, while JS (or others) are "CPU" code.

Process:
1. Get the HTML tag "canvas" and request a WebGL2 context.
2. We create a "Buffer" (a place in memory)