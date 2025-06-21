> [!IMPORTANT]  
> This **ARCHIVED** project follows multiple tutorials on Youtube and the internet. It was used to learn WebGL / OpenGL in general. The DevLog is my own though during this process. If anything is wrong or offends you in here, my bad! :)

> [!NOTE]  
> This project was supposed to remain private, but why not show it to the rest of the world in the end? Nothing fancy here, I just write what I followed in the tutorials in my own way.

### Package:
 - NodeJS v23.11.0
 - https-localhost v4.7.1
 - typescript v5.8.3
 - webpack v5.99.9
 - webpack-cli v6.0.1
 - ts-loader v9.5.2

### Extensions:
 - glsl-canvas v0.2.15 by __circledev__ (*Live WebGL preview of GLSL shaders*)
 - Live Preview v0.4.15 by __Microsoft__ (*Hosts a local server in your workspace for you to preview your webpages on.*)
 - WebGL GLSL Editor v1.3.8 by __Rácz Zalán__ (*Language support for WebGL GLSL shaders.*)
 - WebGL Syntax Hint v0.0.2 by __nieyuyao__ (*webgl plugin syntax*)

### Usages:
 - glsl-canvas : *"Show glslCanvas" command*
 - WebGL GLSL Editor : *edit and compile shaders*
 - WebGl Syntax Hint : *autocomplete*
 - Typescript : *<code>tsc --watch</code> command to compile from .ts to .js*
 - Webpack : *<code>webpack --watch</code> command to compile from all .ts to a single .js*

### Tutorial and Learning materials:  
(Really great content, go watch!)  
 - [WebGL Tutorial by Indigo Code ](https://www.youtube.com/watch?v=y2UsQB3WSvo)
 - [Math related video by Pikuma](https://www.youtube.com/@pikuma)
 - [Online WebGL Tutorials](https://webglfundamentals.org/webgl/lessons/)
 - [3D Grapgics Engine tutorial by javidx9](https://www.youtube.com/watch?v=ih20l3pJoeU)
 - [WebGL 2.0 tutorial by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

### Structure:
- folder_webgl
   - [dist](/dist/) # Compiled files
      - [main.js](/dist/main.js) # Compiled file containing all .ts files.
   - [docs](/docs/) # Documentation
      - [img](/docs/img/) # Folder
      - [DEVLOG.md](/docs/DEVLOG.md)
      - [LICENCE](/docs/LICENCE)
      - [README.md](/docs/README.md)
   - node_modules (ignored by git)
   - [shaders](/shaders/) # Shaders code
      - [fragment_shader.frag](/shaders/fragment_shader.frag)
      - [vertex_shader.vert](/shaders/vertex_shader.vert)
   - [src](/src/) # Source files
      - [class.ts](/src/class.ts) # Classes
      - [function.ts](/src/function.ts) # Functions
      - [geometry.ts](/src/geometry.ts) # Geometry data (vertices & indices)
      - [main.ts](/src/main.ts) # Main loop / program
   - [index.html](/index.html) # Main web page
   - .gitignore # For Git
   - package-lock.json (ignored by git)
   - [package.json](/package.json) # For NodeJS
   - [tsconfig.json](/tsconfig.json) # For Typescript
   - [webpack.config.js](/webpack.config.js) # For Webpack

### The final result :)

![result image](/docs/img/result.png)
