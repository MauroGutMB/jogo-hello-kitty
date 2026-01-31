import './style.css';
import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import KitchenScene from './scenes/KitchenScene';

/**
 * Main Phaser Game Configuration
 * Hello Kitty Cooking Simulator - Point & Click Game
 * 
 * RESPONSIVE DESIGN APPROACH:
 * - Uses a base resolution of 800x600 (4:3 aspect ratio, good for both portrait and landscape)
 * - ScaleManager with FIT mode ensures the game scales to fit the screen while maintaining aspect ratio
 * - autoCenter ensures the canvas is always centered on the viewport
 * - Works seamlessly on mobile and desktop browsers
 */

const VIEWPORT_WIDTH = Math.max(window.innerWidth, 320);
const VIEWPORT_HEIGHT = Math.max(window.innerHeight, 240);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // Automatically choose WebGL or Canvas
  parent: 'app', // Container div id
  backgroundColor: '#ffd9ec', // Soft pink background (Hello Kitty theme)
  
  /**
   * SCALE MANAGER CONFIGURATION (Critical for Responsive Design)
   * 
   * Base Resolution: 1000x700 (design reference)
   * - Scenes use percentages, so layout adapts to any screen size
   * - ScaleManager in RESIZE mode makes the canvas match the viewport size
   * - This removes letterboxing and keeps gameplay centered on any device
   */
  scale: {
    mode: Phaser.Scale.RESIZE, // True responsive: canvas resizes to viewport
    autoCenter: Phaser.Scale.CENTER_BOTH, // Keeps the canvas centered
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    
    /**
     * For mobile-first portrait mode, you could use:
     * width: 375,  // iPhone portrait width
     * height: 667, // iPhone portrait height
     * But 800x600 is more flexible for both orientations
     */
    
    // Scene layout uses percentages, so no fixed base is enforced here.
  },

  /**
   * PHYSICS CONFIGURATION
   * Using Arcade physics for simple 2D game mechanics
   */
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // No gravity for point-and-click cooking
      debug: false // Set to true during development to see collision boxes
    }
  },

  /**
   * SCENE CONFIGURATION
   * Defines the game scenes and their load order
   */
  scene: [
    PreloadScene,  // First scene: loads assets and shows loading bar
    KitchenScene   // Main gameplay scene
  ],

  /**
   * RENDERING OPTIONS
   */
  render: {
    antialias: true, // Smooth edges
    pixelArt: false, // Set to true if using pixel art sprites
    roundPixels: true // Prevents sub-pixel rendering issues
  },

  /**
   * INPUT CONFIGURATION
   * Optimized for touch devices (mobile) and mouse (desktop)
   */
  input: {
    activePointers: 3 // Support multi-touch (up to 3 fingers)
  }
};

/**
 * Initialize the Phaser game instance
 * The game will automatically attach to the #app div and start with PreloadScene
 */
const game = new Phaser.Game(config);

/**
 * RESPONSIVE WINDOW RESIZE HANDLER (Stable on rotation)
 * Ensures the canvas matches the viewport after resize/orientation changes.
 */
let resizeHandle: number | null = null;
const scheduleResize = (): void => {
  if (resizeHandle !== null) return;
  resizeHandle = window.requestAnimationFrame(() => {
    resizeHandle = null;
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
};

window.addEventListener('resize', scheduleResize);

// Some mobile browsers fire orientationchange before layout settles
window.addEventListener('orientationchange', () => {
  window.setTimeout(() => scheduleResize(), 100);
});

/**
 * MOBILE-SPECIFIC OPTIMIZATIONS
 */
if (window.innerWidth < 768) {
  // Mobile device detected
  console.log('Mobile device detected - touch controls enabled');
  
  // Prevent pull-to-refresh on mobile browsers
  document.body.style.overscrollBehavior = 'none';
  
  // Prevent zoom on double-tap
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
}

// Export game instance for debugging in console
export default game;
