#version 300 es

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_instanceOffset;
layout(location = 2) in vec2 a_size;
layout(location = 3) in vec4 a_uvRect;
layout(location = 4) in float a_rotation;
layout(location = 5) in vec2 a_pivot;
layout(location = 6) in vec2 a_trimOffset;

layout(std140) uniform CameraBlock {
    mat4 u_viewProjection; // project(投影) * view(視圖)
};

out vec2 v_uv;

void main(void) {
    vec2 local = a_position * a_size; // 單位矩形放大到正常尺寸
    local += a_trimOffset; // 根據左下將矩形偏移到正確的位置
    local -= a_pivot; // 參考點移到原點

    // 圍繞著新原點進行旋轉（此時使用的是校正後的幾何位置）
    float s = sin(a_rotation);
    float c = cos(a_rotation);
    vec2 rotated = vec2(local.x * c - local.y * s, local.x * s + local.y * c);

    // 加上世界位置偏移
    vec2 world = rotated + a_instanceOffset;
    gl_Position = u_viewProjection * vec4(world, 0.0f, 1.0f);

    v_uv = a_uvRect.xy + a_position * a_uvRect.zw;
}
