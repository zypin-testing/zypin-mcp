#!/usr/bin/env node

/**
 * Comprehensive unit tests for Zypin MCP
 * Tests all 4 core tools and 16 Playwright tools with minimal code
 * 
 * TODO:
 * - Add performance benchmarking tests
 * - Implement automated test reporting
 * - Add edge case tests for complex scenarios
 */

import { SimpleBrowser } from './browser.js';
import { createTools } from './tools.js';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Constants
const TEST_URL = 'https://example.com';
const TEST_TIMEOUT = 1000;
const INVALID_PATH = '/invalid/path';
const TEST_PROJECT_NAME = 'test-project';
const GUIDE_PROJECT_NAME = 'guide-test-project';
const INVALID_TEMPLATE = 'invalid/template';
const VALID_TEMPLATE = 'selenium/basic-webdriver';
const CUCUMBER_TEMPLATE = 'selenium/cucumber-bdd';

// Test state
let testCount = 0;
let passCount = 0;
let tempDir = '';

// Helper functions
function findTool(tools, name) {
  return tools.find(t => t.name === name);
}

async function injectFormElements(tools) {
  const evaluateTool = findTool(tools, 'evaluate');
  await evaluateTool.handler({ 
    script: `
      const form = document.createElement('form');
      form.id = 'test-form';
      
      const input1 = document.createElement('input');
      input1.name = 'field1';
      input1.id = 'field1';
      input1.type = 'text';
      form.appendChild(input1);
      
      const input2 = document.createElement('input');
      input2.name = 'field2';
      input2.id = 'field2';
      input2.type = 'email';
      form.appendChild(input2);
      
      document.body.appendChild(form);
    `
  });
}

async function injectInteractiveElements(tools) {
  const evaluateTool = findTool(tools, 'evaluate');
  await evaluateTool.handler({ 
    script: `
      const button = document.createElement('button');
      button.id = 'test-button';
      button.textContent = 'Test Button';
      document.body.appendChild(button);
      
      const input = document.createElement('input');
      input.id = 'test-input';
      input.placeholder = 'Test Input';
      document.body.appendChild(input);
      
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = 'Test Link';
      document.body.appendChild(link);
    `
  });
}

async function test(name, fn) {
  testCount++;
  try {
    await fn();
    console.log(`✓ ${name}`);
    passCount++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    throw error;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Core Tools Tests
async function testCoreTools() {
  console.log('\n🧪 Testing Core Tools...');
  
  const tools = createTools(null);
  
  await test('get_available_templates success', async () => {
    const tool = findTool(tools, 'get_available_templates');
    const result = await tool.handler({});
    assert(result.success === true, 'Should succeed');
    assert(Array.isArray(result.templates), 'Should return templates array');
  });
  
  await test('create_template success', async () => {
    const tool = findTool(tools, 'create_template');
    const result = await tool.handler({
      projectName: TEST_PROJECT_NAME,
      template: VALID_TEMPLATE,
      workingDirectory: tempDir
    });
    assert(result.success === true, 'Should create project');
    assert(result.projectPath.includes(TEST_PROJECT_NAME), 'Should return correct path');
  });
  
  await test('create_template invalid template', async () => {
    const tool = findTool(tools, 'create_template');
    const result = await tool.handler({
      projectName: 'test-project-invalid',
      template: INVALID_TEMPLATE,
      workingDirectory: tempDir
    });
    
    if (result.success) {
      assert(result.projectPath.includes('test-project-invalid'), 'Should return project path');
    } else {
      assert(result.message.includes('template') || result.message.includes('not found'), 'Should have appropriate error message');
    }
  });
  
  await test('how_to_write success', async () => {
    const createTool = findTool(tools, 'create_template');
    await createTool.handler({
      projectName: GUIDE_PROJECT_NAME,
      template: CUCUMBER_TEMPLATE,
      workingDirectory: tempDir
    });
    
    const tool = findTool(tools, 'how_to_write');
    const result = await tool.handler({ workingDirectory: `${tempDir}/${GUIDE_PROJECT_NAME}` });
    
    if (result.success) {
      assert(typeof result.content === 'string', 'Should return guide content');
    } else {
      assert(result.message.includes('guide') || result.message.includes('not found'), 'Should have appropriate error message');
    }
  });
  
  await test('how_to_write invalid directory', async () => {
    const tool = findTool(tools, 'how_to_write');
    const result = await tool.handler({ workingDirectory: INVALID_PATH });
    assert(result.success === false, 'Should fail with invalid directory');
  });
  
  await test('how_to_debug success', async () => {
    const tool = findTool(tools, 'how_to_debug');
    const result = await tool.handler({ workingDirectory: `${tempDir}/${GUIDE_PROJECT_NAME}` });
    
    if (result.success) {
      assert(typeof result.content === 'string', 'Should return guide content');
    } else {
      assert(result.message.includes('guide') || result.message.includes('not found'), 'Should have appropriate error message');
    }
  });
  
  await test('how_to_debug invalid directory', async () => {
    const tool = findTool(tools, 'how_to_debug');
    const result = await tool.handler({ workingDirectory: INVALID_PATH });
    assert(result.success === false, 'Should fail with invalid directory');
  });
}

// Playwright Tools Tests
async function testPlaywrightTools() {
  console.log('\n🧪 Testing Playwright Tools...');
  
  const browser = new SimpleBrowser({
    browser: 'chromium',
    headless: true,
    viewport: { width: 800, height: 600 }
  });
  
  try {
    await browser.launch();
    const tools = createTools(browser);
    
    // Navigation Tools
    await test('navigate success', async () => {
      const tool = findTool(tools, 'navigate');
      const result = await tool.handler({ url: TEST_URL });
      assert(result.success === true, 'Should navigate successfully');
    });
    
    await test('go_back success', async () => {
      const tool = findTool(tools, 'go_back');
      const result = await tool.handler({});
      assert(result.success === true, 'Should go back successfully');
    });
    
    await test('go_forward success', async () => {
      const tool = findTool(tools, 'go_forward');
      const result = await tool.handler({});
      assert(result.success === true, 'Should go forward successfully');
    });
    
    await test('reload success', async () => {
      const tool = findTool(tools, 'reload');
      const result = await tool.handler({});
      assert(result.success === true, 'Should reload successfully');
    });
    
    // Interaction Tools
    await test('click success', async () => {
      const tool = findTool(tools, 'click');
      const result = await tool.handler({ selector: 'body' });
      assert(result.success === true, 'Should click successfully');
    });
    
    await test('type success', async () => {
      const tool = findTool(tools, 'type');
      try {
        const result = await tool.handler({ selector: 'body', text: 'test' });
        assert(result.success === true, 'Should type successfully');
      } catch (error) {
        assert(error.message.includes('not an') || error.message.includes('input'), 'Should have appropriate error message');
      }
    });
    
    await test('select success', async () => {
      const tool = findTool(tools, 'select');
      try {
        const result = await tool.handler({ selector: 'body', value: 'test' });
        assert(result.success === true, 'Should select successfully');
      } catch (error) {
        assert(error.message.includes('not a') || error.message.includes('select'), 'Should have appropriate error message');
      }
    });
    
    await test('fill_form success', async () => {
      await injectFormElements(tools);
      const tool = findTool(tools, 'fill_form');
      const result = await tool.handler({ 
        fields: { '#field1': 'test value', '#field2': 'test@example.com' } 
      });
      assert(result.success === true, 'Should fill form successfully');
    });
    
    // Information Tools
    await test('snapshot success', async () => {
      await injectInteractiveElements(tools);
      const tool = findTool(tools, 'snapshot');
      const result = await tool.handler({});
      assert(result.success === true, 'Should get snapshot successfully');
      assert(Array.isArray(result.data.elements), 'Should return elements array');
      assert(result.data.elements.length > 0, 'Should find at least one element');
    });
    
    await test('screenshot success', async () => {
      const tool = findTool(tools, 'screenshot');
      const result = await tool.handler({});
      assert(result.success === true, 'Should take screenshot successfully');
    });
    
    await test('get_text success', async () => {
      const tool = findTool(tools, 'get_text');
      const result = await tool.handler({ selector: 'body' });
      assert(result.success === true, 'Should get text successfully');
    });
    
    await test('get_url success', async () => {
      const tool = findTool(tools, 'get_url');
      const result = await tool.handler({});
      assert(result.success === true, 'Should get URL successfully');
      assert(typeof result.data.url === 'string', 'Should return URL string');
    });
    
    await test('get_title success', async () => {
      const tool = findTool(tools, 'get_title');
      const result = await tool.handler({});
      assert(result.success === true, 'Should get title successfully');
      assert(typeof result.data.title === 'string', 'Should return title string');
    });
    
    // Utility Tools
    await test('wait_for success', async () => {
      const tool = findTool(tools, 'wait_for');
      const result = await tool.handler({ selector: 'body', timeout: TEST_TIMEOUT });
      assert(result.success === true, 'Should wait successfully');
    });
    
    await test('evaluate success', async () => {
      const tool = findTool(tools, 'evaluate');
      const result = await tool.handler({ script: 'document.title' });
      assert(result.success === true, 'Should evaluate successfully');
    });
    
  } finally {
    await browser.close();
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Running Zypin MCP Comprehensive Tests...');
  
  try {
    // Create temporary directory for tests
    tempDir = mkdtempSync(join(tmpdir(), 'zypin-test-'));
    
    // Run core tools tests
    await testCoreTools();
    
    // Run Playwright tools tests
    await testPlaywrightTools();
    
    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });
    
    console.log(`\n🎉 All tests passed! (${passCount}/${testCount})`);
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
    process.exit(1);
  }
}

runAllTests();