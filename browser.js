/**
 * Simple browser wrapper for Zypin MCP
 * Provides essential browser automation methods using Playwright
 * 
 * TODO:
 * - Add support for browser extensions
 * - Implement browser profile management
 * - Add network request interception
 * - Support for multiple browser instances
 * - Add browser performance monitoring
 * - Implement browser crash recovery
 */

import { chromium, firefox, webkit } from 'playwright-core';

export class SimpleBrowser {
  constructor(config = {}) {
    this.config = config;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async launch() {
    try {
      // Get the appropriate browser type (chromium, firefox, webkit)
      const browserType = this.getBrowserType();
      this.browser = await browserType.launch({
        headless: this.config.headless
      });
      
      // Create a new browser context with configured viewport
      this.context = await this.browser.newContext({
        viewport: this.config.viewport
      });
      
      // Create a new page and set default timeout
      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.config.timeout);
      
      return true;
    } catch (error) {
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  getBrowserType() {
    switch (this.config.browser) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      default:
        return chromium;
    }
  }

  async ensureLaunched() {
    if (!this.browser) {
      await this.launch();
    }
  }

  async navigate(url) {
    await this.ensureLaunched();
    await this.page.goto(url);
  }

  async goBack() {
    await this.ensureLaunched();
    await this.page.goBack();
  }

  async goForward() {
    await this.ensureLaunched();
    await this.page.goForward();
  }

  async reload() {
    await this.ensureLaunched();
    await this.page.reload();
  }

  async click(selector) {
    await this.ensureLaunched();
    await this.page.click(selector);
  }

  async type(selector, text) {
    await this.ensureLaunched();
    await this.page.fill(selector, text);
  }

  async select(selector, value) {
    await this.ensureLaunched();
    await this.page.selectOption(selector, value);
  }

  async fillForm(fields) {
    await this.ensureLaunched();
    for (const [selector, value] of Object.entries(fields)) {
      await this.page.fill(selector, value);
    }
  }

  async getText(selector) {
    await this.ensureLaunched();
    return await this.page.textContent(selector);
  }

  async getUrl() {
    await this.ensureLaunched();
    return this.page.url();
  }

  async getTitle() {
    await this.ensureLaunched();
    return await this.page.title();
  }

  async waitFor(selector, timeout = 5000) {
    await this.ensureLaunched();
    await this.page.waitForSelector(selector, { timeout });
  }

  async evaluate(script) {
    await this.ensureLaunched();
    return await this.page.evaluate(script);
  }

  async screenshot(filename) {
    await this.ensureLaunched();
    const path = filename || `screenshot-${Date.now()}.png`;
    await this.page.screenshot({ path });
    return path;
  }

  async snapshot() {
    await this.ensureLaunched();
    
    // Get basic page information
    const url = await this.getUrl();
    const title = await this.getTitle();
    
    // Extract all interactive elements from the page
    const elements = await this.page.evaluate(() => {
      const interactive = document.querySelectorAll('a, button, input, select, textarea, [onclick], [role="button"]');
      return Array.from(interactive).map((el, index) => ({
        index,
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim() || el.value || el.placeholder || '',
        type: el.type || '',
        role: el.getAttribute('role') || '',
        id: el.id || '',
        className: el.className || ''
      }));
    });

    // Return page snapshot with filtered interactive elements
    return {
      url,
      title,
      elements: elements.filter(el => el.text || el.id || el.className)
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}
