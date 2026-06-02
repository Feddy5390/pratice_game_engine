#version 300 es

precision mediump float;

uniform sampler2D u_atlas;
in vec2 v_uv;
out vec4 fragColor;

void main() {
    // fragColor = texture(u_atlas, v_uv);
    fragColor = vec4(0.09f, 0.34f, 0.88f, 1.0f);
}