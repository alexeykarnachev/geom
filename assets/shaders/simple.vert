#version 300 es
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
