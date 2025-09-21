/**
 * Configuration management for Zypin MCP
 * Handles loading, validation, and default settings for browser automation
 * 
 * TODO:
 * - Add support for environment variable configuration
 * - Implement configuration file watching and hot reload
 * - Add configuration validation with detailed error messages
 * - Support for multiple configuration profiles
 * - Add configuration encryption for sensitive settings
 * - Implement configuration backup and restore
 */

export async function parseConfig(configPath) {
  try {
    if (configPath) {
      const fs = await import('fs');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return validateConfig(configData);
    }
    return createDefaultConfig();
  } catch (error) {
    console.error('Invalid configuration:', error.message);
    process.exit(1);
  }
}

export function createDefaultConfig() {
  return {
    browser: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    timeout: 30000
  };
}

export function validateConfig(config) {
  const validBrowsers = ['chromium', 'firefox', 'webkit'];
  
  if (config.browser && !validBrowsers.includes(config.browser)) {
    throw new Error(`Invalid browser: ${config.browser}. Must be one of: ${validBrowsers.join(', ')}`);
  }
  
  if (config.headless !== undefined && typeof config.headless !== 'boolean') {
    throw new Error('headless must be a boolean');
  }
  
  if (config.viewport) {
    if (typeof config.viewport.width !== 'number' || config.viewport.width <= 0) {
      throw new Error('viewport.width must be a positive number');
    }
    if (typeof config.viewport.height !== 'number' || config.viewport.height <= 0) {
      throw new Error('viewport.height must be a positive number');
    }
  }
  
  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new Error('timeout must be a positive number');
  }
  
  return {
    browser: config.browser || 'chromium',
    headless: config.headless !== undefined ? config.headless : true,
    viewport: {
      width: config.viewport?.width || 1280,
      height: config.viewport?.height || 720
    },
    timeout: config.timeout || 30000
  };
}
