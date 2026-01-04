attribute vec3 a_Position;
uniform mat4 u_ModelTransform;
uniform mat4 u_ViewProjTransform;

void main(void) {
    gl_Position = u_ViewProjTransform * u_ModelTransform * vec4(a_Position, 1.0);
}