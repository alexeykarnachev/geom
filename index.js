const SCENE_CANVAS = document.getElementById("scene");
const GL = SCENE_CANVAS.getContext("webgl2");

const VERT_SHADER_SRC  = `#version 300 es
    // #pragma vscode_glsllint_stage : vert
    precision mediump float;

    in vec2 a_position;

    void main(void) {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`

const FRAG_SHADER_SRC = `#version 300 es
    // #pragma vscode_glsllint_stage : vert
    precision mediump float;

    out vec4 f_color;

    void main(void) {
        f_color = vec4(0.0, 1.0, 0.0, 1.0);
    }
`


async function main() {
    const model = {
        vertex_positions: new Float32Array([-1, 1, 1, 1, 1, -1, -1, -1]),
        vertex_colors: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0]),
        vertex_indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
    };
    const program = compile_program(VERT_SHADER_SRC, FRAG_SHADER_SRC);
    const vertex_positions_loc = GL.getAttribLocation(program, "a_position");

    const vao = GL.createVertexArray();
    const ebo = GL.createBuffer();

    GL.bindVertexArray(vao);

    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, model.vertex_positions, GL.STATIC_DRAW);
    GL.vertexAttribPointer(vertex_positions_loc, 2, GL.FLOAT, false, 8, 0);
    GL.enableVertexAttribArray(vertex_positions_loc);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ebo);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, model.vertex_indices, GL.STATIC_DRAW);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    requestAnimationFrame(() => draw(
        program,
        vao,
        ebo,
        vertex_positions_loc,
    ));
}

function draw(
    program,
    vao,
    ebo,
    vertex_positions_loc,
) {
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    GL.clearDepth(1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.useProgram(program);
    GL.bindVertexArray(vao);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ebo);
    let n_elements = GL.getBufferParameter(GL.ELEMENT_ARRAY_BUFFER, GL.BUFFER_SIZE) / 2;

    GL.drawElements(GL.TRIANGLES, n_elements, GL.UNSIGNED_SHORT, 0);

    requestAnimationFrame(() => draw(
        program,
        vao,
        ebo,
        n_elements,
        vertex_positions_loc,
    ));
}

function compile_program(vert_shader_src, frag_shader_src) {
    const vert_shader = compile_shader(GL.VERTEX_SHADER, vert_shader_src);
    const frag_shader = compile_shader(GL.FRAGMENT_SHADER, frag_shader_src);
    const shader = GL.createProgram();

    GL.attachShader(shader, vert_shader);
    GL.attachShader(shader, frag_shader);
    GL.linkProgram(shader);

    if (!GL.getProgramParameter(shader, GL.LINK_STATUS)) {
        throw (`Can't compile shader: ${GL.getProgramInfoLog(shader)}`);
    }

    return shader;
}

function compile_shader(type, source) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader)

    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        throw (`Can't compile shader: ${GL.getShaderInfoLog(shader)}`);
    }

    return shader;
}

window.onload = main;
