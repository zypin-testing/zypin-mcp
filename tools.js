/**
 * MCP tools implementation for Zypin MCP
 * Defines all available browser automation tools with their schemas and handlers
 * 
 * TODO:
 * - Add more advanced interaction tools (drag, swipe, hover)
 * - Implement file upload/download tools
 * - Add cookie and storage management tools
 * - Support for iframe navigation
 * - Add accessibility testing tools
 * - Implement screenshot comparison tools
 */

export function createTools(browser) {
  return [
    // Navigation Tools
    {
      name: 'navigate',
      description: 'Navigate to a URL',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to navigate to' }
        },
        required: ['url']
      },
      handler: async ({ url }) => {
        await browser.navigate(url);
        return { success: true, message: `Navigated to ${url}` };
      }
    },
    {
      name: 'go_back',
      description: 'Go back to the previous page',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        await browser.goBack();
        return { success: true, message: 'Went back to previous page' };
      }
    },
    {
      name: 'go_forward',
      description: 'Go forward to the next page',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        await browser.goForward();
        return { success: true, message: 'Went forward to next page' };
      }
    },
    {
      name: 'reload',
      description: 'Reload the current page',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        await browser.reload();
        return { success: true, message: 'Page reloaded' };
      }
    },

    // Interaction Tools
    {
      name: 'click',
      description: 'Click an element on the page',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector for the element to click' }
        },
        required: ['selector']
      },
      handler: async ({ selector }) => {
        await browser.click(selector);
        return { success: true, message: `Clicked element: ${selector}` };
      }
    },
    {
      name: 'type',
      description: 'Type text into an input field',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector for the input field' },
          text: { type: 'string', description: 'Text to type' }
        },
        required: ['selector', 'text']
      },
      handler: async ({ selector, text }) => {
        await browser.type(selector, text);
        return { success: true, message: `Typed "${text}" into ${selector}` };
      }
    },
    {
      name: 'select',
      description: 'Select an option from a dropdown',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector for the select element' },
          value: { type: 'string', description: 'Value to select' }
        },
        required: ['selector', 'value']
      },
      handler: async ({ selector, value }) => {
        await browser.select(selector, value);
        return { success: true, message: `Selected "${value}" in ${selector}` };
      }
    },
    {
      name: 'fill_form',
      description: 'Fill multiple form fields at once',
      inputSchema: {
        type: 'object',
        properties: {
          fields: { 
            type: 'object', 
            additionalProperties: { type: 'string' },
            description: 'Object with selector as key and value as text to fill' 
          }
        },
        required: ['fields']
      },
      handler: async ({ fields }) => {
        await browser.fillForm(fields);
        return { success: true, message: `Filled ${Object.keys(fields).length} form fields` };
      }
    },

    // Information Tools
    {
      name: 'snapshot',
      description: 'Get a snapshot of the current page with interactive elements',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        const snapshot = await browser.snapshot();
        return { 
          success: true, 
          data: snapshot,
          message: `Page snapshot captured for ${snapshot.url}`
        };
      }
    },
    {
      name: 'screenshot',
      description: 'Take a screenshot of the current page',
      inputSchema: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Optional filename for the screenshot' }
        },
        required: []
      },
      handler: async ({ filename }) => {
        const path = await browser.screenshot(filename);
        return { success: true, message: `Screenshot saved to ${path}` };
      }
    },
    {
      name: 'get_text',
      description: 'Get text content from an element',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector for the element' }
        },
        required: ['selector']
      },
      handler: async ({ selector }) => {
        const text = await browser.getText(selector);
        return { success: true, data: { text }, message: `Got text from ${selector}` };
      }
    },
    {
      name: 'get_url',
      description: 'Get the current page URL',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        const url = await browser.getUrl();
        return { success: true, data: { url }, message: `Current URL: ${url}` };
      }
    },
    {
      name: 'get_title',
      description: 'Get the current page title',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        const title = await browser.getTitle();
        return { success: true, data: { title }, message: `Page title: ${title}` };
      }
    },

    // Utility Tools
    {
      name: 'wait_for',
      description: 'Wait for an element to appear on the page',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector for the element to wait for' },
          timeout: { type: 'number', description: 'Timeout in milliseconds (default: 5000)' }
        },
        required: ['selector']
      },
      handler: async ({ selector, timeout = 5000 }) => {
        await browser.waitFor(selector, timeout);
        return { success: true, message: `Element ${selector} appeared within ${timeout}ms` };
      }
    },
    {
      name: 'evaluate',
      description: 'Run JavaScript code on the page',
      inputSchema: {
        type: 'object',
        properties: {
          script: { type: 'string', description: 'JavaScript code to execute' }
        },
        required: ['script']
      },
      handler: async ({ script }) => {
        const result = await browser.evaluate(script);
        return { success: true, data: { result }, message: 'JavaScript executed successfully' };
      }
    },
    {
      name: 'close',
      description: 'Close the browser',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        await browser.close();
        return { success: true, message: 'Browser closed' };
      }
    }
  ];
}

