#version 300 es

layout(location = 0) in vec2 a_position;

layout(std140) uniform CameraBlock {
    mat4 u_viewProjection;
};

void main(void) {
    gl_Position = u_viewProjection * vec4(a_position, 0.0f, 1.0f);
    gl_PointSize = 5.0;
}
