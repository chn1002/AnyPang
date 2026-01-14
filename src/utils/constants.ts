/**
 * Game constants for AnyPang
 * All magic numbers and configuration values should be defined here
 */

// ============================================================
// Game Board Configuration
// ============================================================

/** Number of rows in the game board */
export const BOARD_ROWS = 8;

/** Number of columns in the game board */
export const BOARD_COLS = 8;

/** Size of each tile in pixels */
export const TILE_SIZE = 64;

/** Gap between tiles in pixels */
export const TILE_GAP = 2;

/** Number of different tile types (colors) */
export const TILE_TYPE_COUNT = 6;

/** Minimum tiles required for a match */
export const MIN_MATCH_LENGTH = 3;

// ============================================================
// Canvas & Display Configuration
// ============================================================

/** Target canvas width */
export const CANVAS_WIDTH = 640;

/** Target canvas height */
export const CANVAS_HEIGHT = 960;

/** Game aspect ratio (width / height) */
export const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

/** Board offset from canvas edge (X) */
export const BOARD_OFFSET_X = (CANVAS_WIDTH - BOARD_COLS * TILE_SIZE) / 2;

/** Board offset from canvas edge (Y) */
export const BOARD_OFFSET_Y = 200;

// ============================================================
// Timing & Animation Configuration
// ============================================================

/** Target frames per second */
export const TARGET_FPS = 60;

/** Fixed timestep in milliseconds */
export const FIXED_TIMESTEP = 1000 / TARGET_FPS;

/** Tile swap animation duration (ms) */
export const SWAP_DURATION = 200;

/** Tile fall animation duration per cell (ms) */
export const FALL_DURATION_PER_CELL = 100;

/** Tile destroy animation duration (ms) */
export const DESTROY_DURATION = 300;

/** Tile spawn animation duration (ms) */
export const SPAWN_DURATION = 200;

/** Score popup animation duration (ms) */
export const SCORE_POPUP_DURATION = 800;

/** Combo text display duration (ms) */
export const COMBO_DISPLAY_DURATION = 1000;

/** Delay between cascade checks (ms) */
export const CASCADE_DELAY = 100;

// ============================================================
// Gameplay Configuration
// ============================================================

/** Default game time limit in seconds */
export const DEFAULT_TIME_LIMIT = 60;

/** Default starting moves */
export const DEFAULT_MOVES = 30;

/** Base score for matching 3 tiles */
export const BASE_MATCH_SCORE = 100;

/** Score multiplier for each additional tile in match */
export const EXTRA_TILE_MULTIPLIER = 1.5;

/** Combo score multiplier increment */
export const COMBO_MULTIPLIER_INCREMENT = 0.5;

/** Maximum combo multiplier */
export const MAX_COMBO_MULTIPLIER = 5.0;

/** Time bonus for matches (seconds) */
export const TIME_BONUS_PER_MATCH = 2;

// ============================================================
// Input Configuration
// ============================================================

/** Minimum drag distance to register swap (pixels) */
export const MIN_SWAP_DISTANCE = 20;

/** Maximum time for a tap gesture (ms) */
export const TAP_THRESHOLD = 200;

/** Double tap detection window (ms) */
export const DOUBLE_TAP_WINDOW = 300;

// ============================================================
// Audio Configuration
// ============================================================

/** Master volume (0-1) */
export const MASTER_VOLUME = 0.7;

/** Music volume (0-1) */
export const MUSIC_VOLUME = 0.5;

/** Sound effects volume (0-1) */
export const SFX_VOLUME = 0.8;

// ============================================================
// Visual Effects Configuration
// ============================================================

/** Number of particles per tile destruction */
export const PARTICLES_PER_DESTROY = 8;

/** Particle lifetime (ms) */
export const PARTICLE_LIFETIME = 500;

/** Screen shake duration (ms) */
export const SHAKE_DURATION = 200;

/** Screen shake intensity (pixels) */
export const SHAKE_INTENSITY = 5;

// ============================================================
// Color Palette
// ============================================================

/** Background color */
export const COLOR_BACKGROUND = '#1a1a2e';

/** Primary accent color */
export const COLOR_PRIMARY = '#e94560';

/** Secondary accent color */
export const COLOR_SECONDARY = '#ff6b6b';

/** Text color */
export const COLOR_TEXT = '#ffffff';

/** Text color (dimmed) */
export const COLOR_TEXT_DIM = 'rgba(255, 255, 255, 0.6)';

/** Tile colors for each type */
export const TILE_COLORS: Record<number, string> = {
  0: '#e94560', // Red
  1: '#4a90d9', // Blue
  2: '#4ecdc4', // Green
  3: '#f9ca24', // Yellow
  4: '#9b59b6', // Purple
  5: '#f39c12', // Orange
};

// ============================================================
// Z-Index Layers
// ============================================================

/** Z-index for background elements */
export const Z_BACKGROUND = 0;

/** Z-index for board tiles */
export const Z_TILES = 10;

/** Z-index for selected tile */
export const Z_SELECTED_TILE = 20;

/** Z-index for effects */
export const Z_EFFECTS = 30;

/** Z-index for UI elements */
export const Z_UI = 100;

/** Z-index for popups/overlays */
export const Z_OVERLAY = 200;

// ============================================================
// Debug Configuration
// ============================================================

/** Enable debug mode (set via environment variable) */
export const DEBUG_MODE = import.meta.env.DEV;

/** Show FPS counter */
export const SHOW_FPS = DEBUG_MODE;

/** Show grid lines */
export const SHOW_GRID = false;

/** Show touch/click positions */
export const SHOW_INPUT_DEBUG = false;

// ============================================================
// Local Storage Keys
// ============================================================

/** Key for high score storage */
export const STORAGE_KEY_HIGH_SCORE = 'anypang_high_score';

/** Key for settings storage */
export const STORAGE_KEY_SETTINGS = 'anypang_settings';

/** Key for game progress storage */
export const STORAGE_KEY_PROGRESS = 'anypang_progress';

// ============================================================
// Asset Paths
// ============================================================

/** Base path for images */
export const ASSET_PATH_IMAGES = '/images';

/** Base path for sounds */
export const ASSET_PATH_SOUNDS = '/sounds';

/** Base path for fonts */
export const ASSET_PATH_FONTS = '/fonts';
