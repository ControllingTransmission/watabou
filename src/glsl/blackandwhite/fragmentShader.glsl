#define GLSLIFY 1
// Common uniforms
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_frame;
uniform float u_threshold;

// Texture uniforms
uniform sampler2D u_texture;

// Texture varyings
varying vec2 v_uv;

void main() {
  float intensity = 0.0;

  float r = texture2D(u_texture, v_uv).r;
  float g = texture2D(u_texture, v_uv).g;
  float b = texture2D(u_texture, v_uv).b;

  if (r + g + b > u_threshold) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}