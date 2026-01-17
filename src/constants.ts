// Screen and projection constants
export const SCREEN_WIDTH = 960;
export const SCREEN_HEIGHT = 600;
export const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

// Pre-calculated screen center coordinates
export const HALF_SCREEN_WIDTH = SCREEN_WIDTH / 2;
export const HALF_SCREEN_HEIGHT = SCREEN_HEIGHT / 2;

// Perspective projection constants
export const FOV = 60; // Field of view in degrees (60° is natural, 90° causes fish-eye distortion)
export const FOV_RAD = (FOV * Math.PI) / 180; // Pre-calculated radians
export const FOCAL_LENGTH = 1 / Math.tan(FOV_RAD / 2); // Pre-calculated focal length