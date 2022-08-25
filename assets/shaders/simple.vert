#version 300 es
precision mediump float;

in vec4 a_position;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main(void) {
    vec4 pos = u_projection * u_modelview * a_position;
    // gl_Position = pos;
    gl_Position = a_position / 100.0;
}
