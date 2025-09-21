# Zypin MCP

A simple MCP (Model Context Protocol) server for browser automation using Playwright. This is a simplified version that focuses on essential browser automation features without the complexity of the full Playwright MCP server.

## Features

- **Simple Setup**: Minimal configuration and dependencies
- **Essential Tools**: Core browser automation functionality
- **Fast**: Lightweight implementation with minimal overhead
- **Reliable**: Focused on the most commonly used features

## Project Structure

```
zypin-mcp/
├── package.json              # Project configuration and dependencies
├── index.js                  # Main CLI entry point and MCP server
├── browser.js                # Simple browser wrapper using Playwright
├── tools.js                  # MCP tools implementation (16 tools)
├── test.js                   # Basic functionality tests
├── .gitignore                # Git ignore rules
├── README.md                 # This documentation
└── node_modules/             # Dependencies (3 packages)
```

### File Descriptions

- **`index.js`**: Main entry point that sets up the MCP server, handles CLI arguments, and manages the browser lifecycle
- **`browser.js`**: Simple wrapper around Playwright that provides essential browser automation methods
- **`tools.js`**: Defines all 16 MCP tools with their schemas and handlers
- **`test.js`**: Basic test suite to verify core functionality
- **`.gitignore`**: Minimal git ignore rules for essential exclusions

## Architecture

The project follows a simple, modular architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP Client    │    │   index.js      │    │   browser.js    │
│   (VS Code,     │◄──►│   (MCP Server)  │◄──►│   (Playwright)  │
│   Cursor, etc.) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   tools.js      │
                       │   (16 MCP Tools)│
                       └─────────────────┘
```

### Component Interactions

1. **MCP Client** sends requests to the server via STDIO transport
2. **index.js** receives MCP protocol messages and routes them to appropriate handlers
3. **tools.js** defines the available tools and their schemas
4. **browser.js** executes the actual browser automation commands

### Key Design Principles

- **Single Responsibility**: Each file has a clear, focused purpose
- **Minimal Dependencies**: Only 3 essential packages
- **Command Line Only**: Simple CLI options, no config files
- **Essential Tools Only**: 16 tools covering 80% of use cases
- **Error Handling**: Clear error messages and graceful failures

## Quick Start

### Installation

```bash
npm install https://github.com/zypin-testing/zypin-mcp
```

### Basic Usage

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "zypin-browser": {
      "command": "npx",
      "args": ["https://github.com/zypin-testing/zypin-mcp"]
    }
  }
}
```

### Command Line Options

```bash
# Basic usage
npx zypin-mcp

# With options
npx zypin-mcp --browser firefox --headed --width 1920 --height 1080
```

**Available Options:**
- `--browser <browser>`: Browser to use (chromium, firefox, webkit) - default: chromium
- `--headless`: Run in headless mode (default)
- `--headed`: Run in headed mode (overrides headless)
- `--width <width>`: Viewport width - default: 1280
- `--height <height>`: Viewport height - default: 720
- `--timeout <timeout>`: Default timeout in milliseconds - default: 30000

**Default Settings:**
- Browser: chromium
- Mode: headless
- Viewport: 1280x720
- Timeout: 30000ms

## Available Tools

### Navigation
- `navigate(url)` - Go to a URL
- `go_back()` - Go back to previous page
- `go_forward()` - Go forward to next page
- `reload()` - Reload current page

### Interaction
- `click(selector)` - Click an element
- `type(selector, text)` - Type text into input field
- `select(selector, value)` - Select option from dropdown
- `fill_form(fields)` - Fill multiple form fields

### Information
- `snapshot()` - Get page snapshot with interactive elements
- `screenshot(filename?)` - Take screenshot
- `get_text(selector)` - Get text from element
- `get_url()` - Get current URL
- `get_title()` - Get page title

### Utilities
- `wait_for(selector, timeout?)` - Wait for element to appear
- `evaluate(script)` - Run JavaScript on page
- `close()` - Close browser

## Examples

### Basic Navigation
```javascript
// Navigate to a website
await navigate({ url: "https://example.com" });

// Take a screenshot
await screenshot({ filename: "homepage.png" });

// Get page information
const info = await snapshot();
console.log(info.title, info.url);
```

### Form Interaction
```javascript
// Fill a login form
await fill_form({
  "#username": "myuser",
  "#password": "mypass"
});

// Click submit button
await click({ selector: "#login-button" });

// Wait for redirect
await wait_for({ selector: ".dashboard" });
```

### Element Interaction
```javascript
// Click a link
await click({ selector: "a[href='/products']" });

// Type in search box
await type({ 
  selector: "#search-input", 
  text: "laptop" 
});

// Select from dropdown
await select({ 
  selector: "#category", 
  value: "electronics" 
});
```

## Comparison with Full Playwright MCP

| Feature | Zypin MCP | Full Playwright MCP |
|---------|------------------|---------------------|
| Bundle Size | ~10MB | ~50MB |
| Dependencies | 3 | 15+ |
| Configuration | CLI only | 50+ options |
| Tools | 15 essential | 30+ advanced |
| Setup Time | 2 minutes | 10+ minutes |
| Use Cases | 80% of scenarios | 100% of scenarios |

## Requirements

- Node.js 18 or newer
- MCP-compatible client (VS Code, Cursor, Claude Desktop, etc.)

## License

MIT

## Development

### Running Tests

```bash
# Run basic functionality tests
node test.js

# Test MCP server startup
npx https://github.com/zypin-testing/zypin-mcp --help
```

### Adding New Tools

To add a new tool:

1. Add the tool definition to `tools.js`:
```javascript
{
  name: 'new_tool',
  description: 'Description of the new tool',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' }
    },
    required: ['param']
  },
  handler: async ({ param }) => {
    // Tool implementation
    return { success: true, message: 'Tool executed' };
  }
}
```

2. Add corresponding method to `browser.js` if needed
3. Update this README with the new tool documentation

### Project Metrics

- **Lines of Code**: ~500 lines total
- **Files**: 6 core files
- **Dependencies**: 3 packages
- **Bundle Size**: ~10MB
- **Startup Time**: < 2 seconds

## Contributing

This is a simplified version focused on essential functionality. For advanced features, consider using the full Playwright MCP server.

### Guidelines

- Keep it simple - avoid adding complexity unless absolutely necessary
- Focus on the 80% use case - don't add features for edge cases
- Maintain the single-file architecture for each component
- Test any changes with the included test suite

## Troubleshooting

### Common Issues

**Browser not found error:**
```bash
# Install Playwright browsers
npx playwright install chromium
```

**MCP client connection issues:**
- Ensure the server starts without errors: `npx https://github.com/zypin-testing/zypin-mcp --help`
- Check that your MCP client configuration is correct
- Verify the server is running in the correct directory

**Tool execution errors:**
- Check that selectors are valid CSS selectors
- Ensure elements exist on the page before interacting
- Use `wait_for` tool to wait for elements to appear

**Command line issues:**
- Check that browser type is one of: `chromium`, `firefox`, `webkit`
- Ensure viewport dimensions are positive numbers
- Verify command line arguments are valid

### Debug Mode

Run with debug output:
```bash
# See server startup messages
npx https://github.com/zypin-testing/zypin-mcp 2>&1 | tee server.log
```

### Getting Help

- Check the [MCP documentation](https://modelcontextprotocol.io/)
- Review the [Playwright documentation](https://playwright.dev/)
- Test with the included `test.js` file
