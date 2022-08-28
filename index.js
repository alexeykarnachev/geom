import { Camera } from "./camera.js";
import { compile_program, get_axis_vao, get_cube_vao, draw_lines, draw_triangles } from "./gl.js";
import { get_model, get_perspective_projection } from "./linear_algebra.js";
import { get_slider_value, get_select_value, get_button_value, create_panel } from "./control_panel.js";

/** @type {HTMLCanvasElement} */
const SCENE_CANVAS = document.getElementById("scene");
/** @type {WebGLRenderingContext} */
const GL = SCENE_CANVAS.getContext("webgl2");

var MOUSE_DOWN = false;
var WHEEL_DOWN = false;
var MOUSE_POSITION = { x: null, y: null };
var CAMERA = new Camera();

async function main() {
    const vert_shader_src = await fetch("./assets/shaders/simple.vert").then(response => response.text());
    const frag_shader_src = await fetch("./assets/shaders/simple.frag").then(response => response.text());
    const program = compile_program(GL, vert_shader_src, frag_shader_src);
    const global_axis_vao = get_axis_vao(GL, program, [0.9, 0.1, 0.1], [0.1, 0.9, 0.1], [0.1, 0.1, 0.9], 100);
    const cube_axis_vao = get_axis_vao(GL, program, [0.7, 0.7, 0.7], [0.7, 0.7, 0.7], [0.7, 0.7, 0.7], 1);
    const cube_vao = get_cube_vao(GL, program);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.lineWidth(3);

    requestAnimationFrame(() => draw(program, global_axis_vao, cube_axis_vao, cube_vao));
}

const ANIMATION_CYCLE_DURATION = 3000;
var ANIMATION_CUR_DURATION = 0;
var LAST_FRAME_TIME = null;

function draw(program, global_axis_vao, cube_axis_vao, cube_vao) {

    const cur_frame_time = new Date();
    let dt = null;
    if (LAST_FRAME_TIME != null) {
        dt = cur_frame_time - LAST_FRAME_TIME;
    }

    let fov = get_slider_value("camera", "fov");
    let znear = 0.1;
    let zfar = 100;
    let aspect_ratio = SCENE_CANVAS.width / SCENE_CANVAS.height;
    let scale = { x: 1.0, y: 1.0, z: 1.0 };
    let translation = { x: 0.0, y: 0.0, z: -5 };

    let view = CAMERA.get_view();
    let projection = get_perspective_projection(fov, znear, zfar, aspect_ratio);

    if (get_button_value("animation", "run") == 1) {
        ANIMATION_CUR_DURATION = (ANIMATION_CUR_DURATION + dt) % ANIMATION_CYCLE_DURATION;
    } else {
        ANIMATION_CUR_DURATION = 0;
    }

    if (ANIMATION_CUR_DURATION != 0) {
        var cube_rotation = get_animation_stage_rotation();
    } else {
        var cube_rotation = {
            x: get_slider_value("euler", "x"),
            y: get_slider_value("euler", "y"),
            z: get_slider_value("euler", "z")
        };
    }

    let cube_rotation_order = get_select_value("euler", "order");
    let cube_model = get_model(scale, cube_rotation, translation, cube_rotation_order);

    let cube_axis_rotation = cube_rotation;
    let cube_axis_model = get_model(scale, cube_axis_rotation, translation, cube_rotation_order);

    let global_axis_rotation = { x: 0.0, y: 0.0, z: 0.0 };
    let global_axis_model = get_model(scale, global_axis_rotation, translation);

    GL.clearColor(0.8, 0.8, 0.9, 1.0);
    GL.clearDepth(1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    draw_lines(GL, program, global_axis_vao, global_axis_model, view, projection, 6);
    draw_lines(GL, program, cube_axis_vao, cube_axis_model, view, projection, 6);
    draw_triangles(GL, program, cube_vao, cube_model, view, projection, 36);

    requestAnimationFrame(() => draw(program, global_axis_vao, cube_axis_vao, cube_vao));
    LAST_FRAME_TIME = cur_frame_time;
}

function get_animation_stage_rotation() {
    const cur_stage = Math.floor((ANIMATION_CUR_DURATION / ANIMATION_CYCLE_DURATION) * 3);
    const cur_stage_duration = ANIMATION_CUR_DURATION % (ANIMATION_CYCLE_DURATION / 3);
    const cur_stage_progress = cur_stage_duration / (ANIMATION_CYCLE_DURATION / 3);
    let rotation_order = get_select_value("euler", "order");
    rotation_order = rotation_order.toLowerCase().split("");
    let rotation = {x: 0, y: 0, z: 0};
    for (let i = 0; i < 3; ++i) {
        let cur_axe = rotation_order[i];
        if (i < cur_stage) {
            rotation[cur_axe] = get_slider_value("euler", cur_axe);
        } else if (i === cur_stage) {
            rotation[cur_axe] = cur_stage_progress * get_slider_value("euler", cur_axe);
        }
    }
    return rotation;
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
