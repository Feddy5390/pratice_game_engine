#version 300 es

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_offset;
layout(location = 2) in vec2 a_size;

layout(std140) uniform CameraBlock {
    mat4 u_viewProjection;
};

void main(void) {
    vec2 worldPosition = a_offset + (a_position * a_size);
    gl_Position = u_viewProjection * vec4(worldPosition, 0.0f, 1.0f);
}
