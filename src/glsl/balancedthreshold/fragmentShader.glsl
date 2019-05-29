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
  // You cannot set these values at run time, so you need to manually set them.
  // This is probably OK for now.
  // Get them with window.innerWidth and window.innerHeight
  const float pixels_wide = 800.0;
  const float pixels_tall = 600.0;

  const float samples_x = 10.0;
  const float samples_y = 10.0;

  float min_intensity = 100000.0;
  float max_intensity = 0.0;
  float sum_intensity = 0.0;
  // NOTE: You are grabbing the maximum, minimum and average intensity in this loop
  // so that you can interpolate between them below

  for (float x = 0.0; x < pixels_wide; x += floor(pixels_wide / samples_x) ) {
    for (float y = 0.0; y < pixels_tall; y += floor(pixels_tall / samples_y)) {
      vec4 pixel = texture2D(u_texture, vec2(x / u_resolution.x, y / u_resolution.y));
      float intensity = pixel.r + pixel.g + pixel.b;
      if (intensity > max_intensity)
        max_intensity = intensity;
      if (intensity < min_intensity)
        min_intensity = intensity;
      sum_intensity += intensity;
    }
  }

  float avg_intensity = sum_intensity / samples_x / samples_y;

  float r = texture2D(u_texture, v_uv).r;
  float g = texture2D(u_texture, v_uv).g;
  float b = texture2D(u_texture, v_uv).b;
  float intensity = r + g + b;

  if (intensity > mix(min_intensity, max_intensity, u_threshold)) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }

  // gl_FragColor = color_register;
}