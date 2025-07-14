/***************************************************************************************************
 * BROWSER POLYFILLS
 */

(window as any).global = window;

// Polyfill for process (if needed by some libraries)
(window as any).process = {
  env: { DEBUG: undefined },
};

// Import and assign crypto-browserify if crypto is needed
// @ts-ignore
import * as crypto from 'crypto-browserify';
(window as any).crypto = crypto;

/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.
