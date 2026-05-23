#version 300 es

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_instanceOffset;
layout(location = 2) in vec2 a_size;
layout(location = 3) in vec4 a_uvRect;
layout(location = 4) in float a_rotation;

layout(std140) uniform CameraBlock {
    mat4 u_viewProjection; // project(投影) * view(視圖)
};

out vec2 v_uv;

void main(void) {
    // 將單位矩陣放大到實際大小
    vec2 scaled = a_position * a_size;

    float s = sin(a_rotation);
    float c = cos(a_rotation);
    vec2 rotated = vec2(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);

    // 加上各實體的位置偏移，算出正確的實體位置
    vec2 worldPosition = rotated + a_instanceOffset;
    gl_Position = u_viewProjection * vec4(worldPosition, 0.0f, 1.0f);

    vec2 uvCoord = a_position + 0.5f; // 將座標校正成 0 ~ 1 (uv座標)
    v_uv = a_uvRect.xy + uvCoord * a_uvRect.zw;
}