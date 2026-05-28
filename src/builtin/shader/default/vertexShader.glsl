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
    // 算出以 Pivot 為原點的比例
    vec2 local = a_position - a_pivot;

    // 放大到實際小圖的像素大小
    local *= a_size;

    // 加入動畫偏移修正（單位：像素）
    // 縮放完成後，直接把 Unity 算出來的偏移量加進去，把角色「校正」回它原本在動畫裡該有的位置
    local -= a_trimOffset;

    // 圍繞著新原點進行旋轉（此時使用的是校正後的幾何位置）
    float s = sin(a_rotation);
    float c = cos(a_rotation);
    vec2 rotated = vec2(local.x * c - local.y * s, local.x * s + local.y * c);

    // 加上世界位置偏移
    vec2 world = rotated + a_instanceOffset;
    gl_Position = u_viewProjection * vec4(world, 0.0f, 1.0f);

    v_uv = a_uvRect.xy + a_position * a_uvRect.zw;
}

