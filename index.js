import { Camera } from "./camera.js";
import { compile_program, get_axis_vao, get_cube_vao, draw_lines, draw_triangles } from "./gl.js";
import { get_model, get_perspective_projection } from "./linear_algebra.js";

/** @type {HTMLCanvasElement} */
const SCENE_CANVAS = document.getElementById("scene");
/** @type {WebGLRenderingContext} */
const GL = SCENE_CANVAS.getContext("webgl2");

var MOUSE_DOWN = false;
var WHEEL_DOWN = false;
var MOUSE_POSITION = { x: null, y: null };
var SIDE_MOVEMENT_SENS = 2.0;
var FORWARD_MOVEMENT_SENS = 2.0;
var ROTATE_SENS = 2.0;
var CAMERA = new Camera();

const VERT_SHADER_SRC = `#version 300 es
    // #pragma vscode_glsllint_stage : vert
    precision mediump float;

    in vec3 a_position;
    in vec3 a_color;

    uniform mat4 u_model;
    uniform mat4 u_view;
    uniform mat4 u_projection;

    out vec3 v_color;

    void main(void) {
        vec4 pos = vec4(a_position, 1.0);
        pos = u_projection * u_view * u_model * pos;

        gl_Position = pos;
        v_color = a_color;
    }
`

const FRAG_SHADER_SRC = `#version 300 es
    // #pragma vscode_glsllint_stage : vert
    precision mediump float;

    in vec3 v_color;

    out vec4 f_color;

    void main(void) {
        f_color = vec4(v_color, 1.0);
    }
`


async function main() {
    const program = compile_program(GL, VERT_SHADER_SRC, FRAG_SHADER_SRC);
    const global_axis_vao = get_axis_vao(GL, program, [0.9, 0.1, 0.1], [0.1, 0.9, 0.1], [0.1, 0.1, 0.9]);
    const cube_axis_vao = get_axis_vao(GL, program, [0.7, 0.07, 0.07], [0.07, 0.7, 0.07], [0.07, 0.07, 0.7]);
    const cube_vao = get_cube_vao(GL, program);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.lineWidth(3);

    requestAnimationFrame(() => draw(program, global_axis_vao, cube_axis_vao, cube_vao));
}


function draw(program, global_axis_vao, cube_axis_vao, cube_vao) {
    let fov = Math.PI / 4;
    let znear = 0.1;
    let zfar = 100;
    let aspect_ratio = SCENE_CANVAS.width / SCENE_CANVAS.height;
    let scale = { x: 1.0, y: 1.0, z: 1.0 };
    let translation = { x: 0.0, y: 0.0, z: -5 };

    let view = CAMERA.get_view();
    let projection = get_perspective_projection(fov, znear, zfar, aspect_ratio);

    let cube_rotation = { x: 0.0, y: 0.0, z: 0.0 };
    let cube_model = get_model(scale, cube_rotation, translation);

    let cube_axis_rotation = cube_rotation;
    let cube_axis_model = get_model(scale, cube_axis_rotation, translation);

    let global_axis_rotation = { x: 0.0, y: 0.0, z: 0.0 };
    let global_axis_model = get_model(scale, global_axis_rotation, translation);

    GL.clearColor(0.8, 0.8, 0.9, 1.0);
    GL.clearDepth(1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    draw_lines(GL, program, global_axis_vao, global_axis_model, view, projection, 6);
    draw_lines(GL, program, cube_axis_vao, cube_axis_model, view, projection, 6);
    draw_triangles(GL, program, cube_vao, cube_model, view, projection, 36);


    requestAnimationFrame(() => draw(program, global_axis_vao, cube_axis_vao, cube_vao));
}

function onmousemove(event) {
    if (MOUSE_POSITION.x !== null) {
        let diff_x = event.x - MOUSE_POSITION.x;
        let diff_y = MOUSE_POSITION.y - event.y;
        if (MOUSE_DOWN) {
            CAMERA.rotate(
                -diff_y * ROTATE_SENS / 1000,
                -diff_x * ROTATE_SENS / 1000
            );
        } else if (WHEEL_DOWN) {
            CAMERA.move_side(
                -diff_x * SIDE_MOVEMENT_SENS / 300,
                -diff_y * SIDE_MOVEMENT_SENS / 300
            );
        }
    }

    MOUSE_POSITION.x = event.x;
    MOUSE_POSITION.y = event.y;
}

function onwheel(event) {
    CAMERA.move_forward(event.deltaY * FORWARD_MOVEMENT_SENS / 300);
}


function onmousedown(event) {
    if (event.buttons === 4) {
        WHEEL_DOWN = true;
    } else if (event.buttons === 1) {
        MOUSE_DOWN = true;
    }
}

function onmouseup() {
    WHEEL_DOWN = false;
    MOUSE_DOWN = false;
}

SCENE_CANVAS.onmousemove = onmousemove;
SCENE_CANVAS.onmousedown = onmousedown;
SCENE_CANVAS.onmouseup = onmouseup;
SCENE_CANVAS.onmouseleave = onmouseup;
SCENE_CANVAS.onwheel = onwheel;

window.onload = main;
