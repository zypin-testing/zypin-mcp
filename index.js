#!/usr/bin/env node

/**
 * Zypin MCP Server - Main Entry Point
 * Simple MCP (Model Context Protocol) server for browser automation using Playwright
 * 
 * TODO:
 * - Add support for multiple browser contexts
 * - Implement browser session persistence
 * - Add more advanced error handling and recovery
 * - Support for custom tool plugins
 * - Add performance monitoring and metrics
 * - Implement graceful shutdown with cleanup
 */

import { program } from 'commander';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SimpleBrowser } from './browser.js';
import { createTools } from './tools.js';
import { parseConfig, createDefaultConfig } from './config.js';

program
  .name('zypin-mcp')
  .description('Simple MCP server for browser automation')
  .version('1.0.0')
  .option('-b, --browser <browser>', 'Browser to use (chromium, firefox, webkit)', 'chromium')
  .option('-h, --headless', 'Run browser in headless mode', true)
  .option('--headed', 'Run browser in headed mode (overrides headless)')
  .option('-w, --width <width>', 'Viewport width', '1280')
  .option('-l, --height <height>', 'Viewport height', '720')
  .option('-t, --timeout <timeout>', 'Default timeout in milliseconds', '30000')
  .option('-c, --config <path>', 'Path to configuration file')
  .parse();

const options = program.opts();

/**
 * Main application entry point
 * Initializes configuration, browser, and MCP server
 */
async function main() {
  try {
    // Parse configuration from file or command line
    let config;
    if (options.config) {
      config = await parseConfig(options.config);
    } else {
      config = createDefaultConfig();
      // Override with command line options
      if (options.browser) config.browser = options.browser;
      if (options.headed) config.headless = false;
      if (options.width) config.viewport.width = parseInt(options.width);
      if (options.height) config.viewport.height = parseInt(options.height);
      if (options.timeout) config.timeout = parseInt(options.timeout);
    }

    console.error('Starting Zypin MCP Server...');
    console.error(`Browser: ${config.browser}, Headless: ${config.headless}`);
    console.error(`Viewport: ${config.viewport.width}x${config.viewport.height}`);

    // Create browser instance (lazy loading - will launch when first tool is called)
    const browser = new SimpleBrowser(config);

    // Create MCP server with tool capabilities
    const server = new Server(
      {
        name: 'zypin-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register all available browser automation tools
    const tools = createTools(browser);
    
    // Handle tool execution requests from MCP clients
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const tool = tools.find(t => t.name === toolName);
      
      if (!tool) {
        throw new Error(`Unknown tool: ${toolName}`);
      }
      
      try {
        // Execute the tool with provided arguments
        const result = await tool.handler(request.params.arguments || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        // Return error response for failed tool execution
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });

    // Handle tool listing requests from MCP clients
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };
    });

    // Create STDIO transport and start MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Zypin MCP Server started successfully');

    // Handle graceful shutdown on process termination
    process.on('SIGINT', async () => {
      console.error('Shutting down...');
      await browser.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Shutting down...');
      await browser.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
