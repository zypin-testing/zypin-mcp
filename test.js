#!/usr/bin/env node

/**
 * Basic functionality tests for Zypin MCP
 * Verifies core browser automation and MCP tool functionality
 * 
 * TODO:
 * - Add comprehensive test coverage for all tools
 * - Implement integration tests with real MCP clients
 * - Add performance benchmarking tests
 * - Create test fixtures and mock data
 * - Add error handling and edge case tests
 * - Implement automated test reporting
 */

import { SimpleBrowser } from './browser.js';
import { createTools } from './tools.js';

async function testBrowser() {
  console.log('Testing Zypin MCP...');
  
  try {
    // Test browser creation
    const browser = new SimpleBrowser({
      browser: 'chromium',
      headless: true,
      viewport: { width: 800, height: 600 }
    });
    
    console.log('✓ Browser instance created');
    
    // Test browser launch
    await browser.launch();
    console.log('✓ Browser launched successfully');
    
    // Test navigation
    await browser.navigate('https://example.com');
    console.log('✓ Navigation successful');
    
    // Test getting page info
    const url = await browser.getUrl();
    const title = await browser.getTitle();
    console.log(`✓ Page info: ${title} at ${url}`);
    
    // Test snapshot
    const snapshot = await browser.snapshot();
    console.log(`✓ Snapshot captured with ${snapshot.elements.length} interactive elements`);
    
    // Test tools creation
    const tools = createTools(browser);
    console.log(`✓ Created ${tools.length} MCP tools`);
    
    // Test a tool
    const navigateTool = tools.find(t => t.name === 'navigate');
    if (navigateTool) {
      console.log('✓ Navigate tool found and ready');
    }
    
    // Cleanup
    await browser.close();
    console.log('✓ Browser closed successfully');
    
    console.log('\n🎉 All tests passed! Zypin MCP is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBrowser();
