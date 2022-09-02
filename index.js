import { Camera } from "./camera.js";
import { compile_program, get_axis_vao, get_cube_vao, draw_lines, draw_triangles, get_grid_vao } from "./gl.js";
import { get_model_matrix, get_perspective_projection_matrix } from "./linear_algebra.js";
import { get_slider_value, get_select_value, get_button_value, create_panel } from "./control_panel.js";
import { Animator } from "./animator.js";

/** @type {HTMLCanvasElement} */
const SCENE_CANVAS = document.getElementById("scene");
/** @type {WebGLRenderingContext} */
const GL = SCENE_CANVAS.getContext("webgl2");

var MOUSE_DOWN = false;
var WHEEL_DOWN = false;
var MOUSE_POSITION = { x: null, y: null };
var CAMERA = new Camera();
var ANIMATOR = new Animator(6000, 1000, "XYZ", "RST");
const BACKGROUND_COLOR = hex2rgb("#C4C6E7");
const GRID_COLOR = hex2rgb("#C4C6E7", 0.7);
const N_GRID_LINES = 50;
const GRID_LENGTH = 200;
const GRID_LINE_WIDTH = 1;
const GLOBAL_AXIS_LINE_WIDTH = 2;

async function main() {
    const vert_shader_src = await fetch("./assets/shaders/simple.vert").then(response => response.text());
    const frag_shader_src = await fetch("./assets/shaders/simple.frag").then(response => response.text());
    const program = compile_program(GL, vert_shader_src, frag_shader_src);
    const global_axis_vao = get_axis_vao(GL, program, hex2rgb("#C33C54", 0.9), hex2rgb("#849324", 0.9), hex2rgb("#437F97", 0.9), 100);
    const grid_vao = get_grid_vao(GL, program, GRID_COLOR, N_GRID_LINES, GRID_LENGTH);
    const cube_axis_vao = get_axis_vao(GL, program, hex2rgb("#C33C54", 0.9), hex2rgb("#849324", 0.9), hex2rgb("#437F97", 0.9), 1);
    const cube_vao = get_cube_vao(GL, program, hex2rgb("#C33C54", 1.3), hex2rgb("#849324", 1.3), hex2rgb("#437F97", 1.3));

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.lineWidth(3);

    requestAnimationFrame(() => draw(program, global_axis_vao, grid_vao, cube_axis_vao, cube_vao));
}

function hex2rgb(hex, k = 1.0) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [k * parseInt(result[1], 16) / 255, k * parseInt(result[2], 16) / 255, k * parseInt(result[3], 16) / 255];
}


var LAST_FRAME_TIME = null;

function draw(program, global_axis_vao, grid_vao, cube_axis_vao, cube_vao) {

    const cur_frame_time = new Date();
    let dt = null;
    if (LAST_FRAME_TIME != null) {
        dt = cur_frame_time - LAST_FRAME_TIME;
    }

    let fov = get_slider_value("camera", "fov");
    let znear = 0.1;
    let zfar = 100;
    let aspect_ratio = SCENE_CANVAS.width / SCENE_CANVAS.height;
    let global_axis_scale = { x: 1.0, y: 1.0, z: 1.0 };
    let global_axis_translation = { x: 0.0, y: 0.0, z: 0.0 };
    let global_axis_rotation = { x: 0.0, y: 0.0, z: 0.0 };

    let view = CAMERA.get_view();
    let projection = get_perspective_projection_matrix(fov, znear, zfar, aspect_ratio);
    ANIMATOR.toggle(get_button_value("animation", "run") == 1);
    ANIMATOR.transformation_order = get_select_value("model", "transformation");
    ANIMATOR.rotation_order = get_select_value("model", "rotation");
    ANIMATOR.step(dt);

    var cube_scale = {
        x: get_slider_value("scale", "x"),
        y: get_slider_value("scale", "y"),
        z: get_slider_value("scale", "z")
    };
    var cube_translation = {
        x: get_slider_value("translation", "x"),
        y: get_slider_value("translation", "y"),
        z: get_slider_value("translation", "z")
    };
    var cube_rotation = {
        x: get_slider_value("euler", "x"),
        y: get_slider_value("euler", "y"),
        z: get_slider_value("euler", "z")
    };

    let cube_model_matrix = ANIMATOR.animate(cube_scale, cube_translation, cube_rotation);
    let global_axis_model_matrix = get_model_matrix(global_axis_scale, global_axis_rotation, global_axis_translation);

    GL.clearColor(...BACKGROUND_COLOR, 1.0);
    GL.clearDepth(1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.lineWidth(GLOBAL_AXIS_LINE_WIDTH);
    draw_lines(GL, program, global_axis_vao, global_axis_model_matrix, view, projection, 6);
    GL.lineWidth(GRID_LINE_WIDTH);
    draw_lines(GL, program, grid_vao, global_axis_model_matrix, view, projection, N_GRID_LINES * 4);
    draw_lines(GL, program, cube_axis_vao, cube_model_matrix, view, projection, 6);
    draw_triangles(GL, program, cube_vao, cube_model_matrix, view, projection, 36);

    requestAnimationFrame(() => draw(program, global_axis_vao, grid_vao, cube_axis_vao, cube_vao));
    LAST_FRAME_TIME = cur_frame_time;
}

function onmousemove(event) {
    if (MOUSE_POSITION.x !== null) {
        let diff_x = event.x - MOUSE_POSITION.x;
        let diff_y = MOUSE_POSITION.y - event.y;
        let sens = get_slider_value("camera", "sensitivity");
        if (MOUSE_DOWN) {
            CAMERA.rotate(
                -diff_y * sens / 1000,
                diff_x * sens / 1000
            );
        } else if (WHEEL_DOWN) {
            CAMERA.move_side(
                -diff_x * sens / 300,
                -diff_y * sens / 300
            );
        }
    }

    MOUSE_POSITION.x = event.x;
    MOUSE_POSITION.y = event.y;
}

function onwheel(event) {
    event.preventDefault();
    let sens = get_slider_value("camera", "sensitivity");
    CAMERA.move_forward(event.deltaY * sens / 300);
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

create_panel();

window.onload = main;
