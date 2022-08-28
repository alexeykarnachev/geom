export function compile_program(gl, vert_shader_src, frag_shader_src) {
    const vert_shader = compile_shader(gl, gl.VERTEX_SHADER, vert_shader_src);
    const frag_shader = compile_shader(gl, gl.FRAGMENT_SHADER, frag_shader_src);
    const shader = gl.createProgram();

    gl.attachShader(shader, vert_shader);
    gl.attachShader(shader, frag_shader);
    gl.linkProgram(shader);

    if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
        throw (`Can't compile shader: ${gl.getProgramInfoLog(shader)}`);
    }

    return shader;
}

function compile_shader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw (`Can't compile shader: ${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
}

function bind_draw(gl, program, vao, model, view, projection) {
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model"), true, model);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_view"), true, view);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_projection"), true, projection);
}

export function draw_lines(gl, program, vao, model, view, projection, count) {
    bind_draw(gl, program, vao, model, view, projection);
    gl.drawArrays(gl.LINES, 0, count);
}


export function draw_triangles(gl, program, vao, model, view, projection, count) {
    bind_draw(gl, program, vao, model, view, projection);
    gl.drawArrays(gl.TRIANGLES, 0, count);
}


export function get_axis_vao(gl, program, x_color, y_color, z_color, length) {
    const data = new Float32Array([
        // X (red)
        -length, 0, 0,
        ...x_color,
        length, 0, 0,
        ...x_color,
        // Y (green)
        0, length, 0,
        ...y_color,
        0, -length, 0,
        ...y_color,
        // Z (blue)
        0, 0, length,
        ...z_color,
        0, 0, -length,
        ...z_color,
    ])

    const a_position = gl.getAttribLocation(program, "a_position");
    const a_color = gl.getAttribLocation(program, "a_color");
    const vao = gl.createVertexArray();

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(a_position);

    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(a_color);

    return vao
}

export function get_cube_vao(gl, program) {
    const k = 0.5;
    const data = new Float32Array([
        // Left face (red)
        -k, -k, k,
        0.9, 0.1, 0.1,
        -k, k, k,
        0.9, 0.1, 0.1,
        -k, k, -k,
        0.9, 0.1, 0.1,
        -k, -k, k,
        0.9, 0.1, 0.1,
        -k, k, -k,
        0.9, 0.1, 0.1,
        -k, -k, -k,
        0.9, 0.1, 0.1,
        // Right face (red)
        k, -k, k,
        0.9, 0.1, 0.1,
        k, k, k,
        0.9, 0.1, 0.1,
        k, k, -k,
        0.9, 0.1, 0.1,
        k, -k, k,
        0.9, 0.1, 0.1,
        k, k, -k,
        0.9, 0.1, 0.1,
        k, -k, -k,
        0.9, 0.1, 0.1,
        // Top face (green)
        -k, k, k,
        0.1, 0.9, 0.1,
        -k, k, -k,
        0.1, 0.9, 0.1,
        k, k, -k,
        0.1, 0.9, 0.1,
        -k, k, k,
        0.1, 0.9, 0.1,
        k, k, -k,
        0.1, 0.9, 0.1,
        k, k, k,
        0.1, 0.9, 0.1,
        // Bot face (green)
        -k, -k, k,
        0.1, 0.9, 0.1,
        -k, -k, -k,
        0.1, 0.9, 0.1,
        k, -k, -k,
        0.1, 0.9, 0.1,
        -k, -k, k,
        0.1, 0.9, 0.1,
        k, -k, -k,
        0.1, 0.9, 0.1,
        k, -k, k,
        0.1, 0.9, 0.1,
        // Front face (blue)
        -k, -k, k,
        0.1, 0.1, 0.9,
        -k, k, k,
        0.1, 0.1, 0.9,
        k, k, k,
        0.1, 0.1, 0.9,
        -k, -k, k,
        0.1, 0.1, 0.9,
        k, k, k,
        0.1, 0.1, 0.9,
        k, -k, k,
        0.1, 0.1, 0.9,
        // Back face (blue)
        -k, -k, -k,
        0.1, 0.1, 0.9,
        -k, k, -k,
        0.1, 0.1, 0.9,
        k, k, -k,
        0.1, 0.1, 0.9,
        -k, -k, -k,
        0.1, 0.1, 0.9,
        k, k, -k,
        0.1, 0.1, 0.9,
        k, -k, -k,
        0.1, 0.1, 0.9,
    ])

    const a_position = gl.getAttribLocation(program, "a_position");
    const a_color = gl.getAttribLocation(program, "a_color");
    const vao = gl.createVertexArray();

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(a_position);

    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(a_color);

    return vao
}
