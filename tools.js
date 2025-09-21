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
    },

    // Template Selection Tool
    {
      name: 'show_available_templates',
      description: 'Show available Zypin templates and let user choose',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Test project name' }
        },
        required: ['projectName']
      },
      handler: async ({ projectName }) => {
        try {
          // Get available templates from zypin system
          const { execSync } = await import('child_process');
          
          // Use zypin CLI to get available templates
          const command = `zypin create-project --help`;
          const helpOutput = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
          
          // Parse available templates from help output
          const availableTemplates = await parseTemplatesFromHelp(helpOutput);
          
          return {
            success: true,
            data: {
              projectName,
              availableTemplates,
              message: `${availableTemplates.length} template(s) available for project "${projectName}"`
            },
            message: `📋 Available Templates:\n${availableTemplates.map((t, i) => `${i + 1}. ${t.name} - ${t.description}`).join('\n')}\n\nChoose template by using: create_test_project with the corresponding template`
          };
        } catch (error) {
          return { success: false, message: `Error getting template list: ${error.message}` };
        }
      }
    },
    {
      name: 'create_test_project',
      description: 'Create test project with selected template',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Test project name' },
          template: { type: 'string', description: 'Selected template (e.g., selenium/basic-webdriver)' },
          workingDirectory: { type: 'string', description: 'Current directory path (from pwd command)' }
        },
        required: ['projectName', 'template', 'workingDirectory']
      },
      handler: async ({ projectName, template, workingDirectory }) => {
        try {
          // Use existing zypin template system
          const { execSync } = await import('child_process');
          const path = await import('path');
          
          // Use the working directory provided by AI (from pwd command)
          const currentDir = workingDirectory;
          
          // First, validate that the template exists
          const availableTemplates = await getTemplatesFromSystem();
          const templateExists = availableTemplates.some(t => t.name === template);
          
          if (!templateExists) {
            return {
              success: false,
              message: `❌ Template "${template}" does not exist!`,
              data: {
                requestedTemplate: template,
                availableTemplates: availableTemplates,
                suggestion: `Please choose one of the available templates:\n${availableTemplates.map((t, i) => `${i + 1}. ${t.name}`).join('\n')}`
              }
            };
          }
          
          // Create project using zypin CLI in the specified directory
          const command = `zypin create-project ${projectName} --template ${template} --force`;
          execSync(command, { stdio: 'pipe', cwd: currentDir });
          
          return {
            success: true,
            message: `✅ Project "${projectName}" created successfully with template ${template}`,
            data: {
              projectPath: path.default.join(currentDir, projectName),
              relativePath: `./${projectName}`,
              workingDirectory: currentDir,
              template,
              nextSteps: [
                `cd ${projectName}`,
                'npm install',
                'zypin start --packages selenium',
                template.includes('cucumber') ? 'zypin run --input features/' : 'zypin run --input test.js'
              ]
            }
          };
        } catch (error) {
          return { success: false, message: `Error creating project: ${error.message}` };
        }
      }
    }
  ];
}

// Helper function to parse templates from zypin help output
async function parseTemplatesFromHelp(helpOutput) {
  try {
    const lines = helpOutput.split('\n');
    const templates = [];
    const seenTemplates = new Set();
    
    // Dynamic template parsing patterns
    const templatePatterns = [
      // Pattern: package/template-name
      /(\w+)\/([\w-]+)/g,
      // Pattern: --template package/template-name
      /--template\s+(\w+)\/([\w-]+)/g
    ];
    
    // Extract templates from help output
    lines.forEach(line => {
      templatePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const packageName = match[1];
          const templateName = match[2];
          const fullName = `${packageName}/${templateName}`;
          
          if (!seenTemplates.has(fullName)) {
            seenTemplates.add(fullName);
            
            templates.push({
              name: fullName,
              description: fullName // Simple: just use template name as description
            });
          }
        }
      });
    });
    
    // If no templates found, try to get from zypin system directly
    if (templates.length === 0) {
      return await getTemplatesFromSystem();
    }
    
    return templates;
  } catch (error) {
    // Fallback to system templates
    return await getTemplatesFromSystem();
  }
}

// Get templates from zypin system directly
async function getTemplatesFromSystem() {
  try {
    const { execSync } = await import('child_process');
    
    // Try to get templates from zypin system
    const command = `zypin create-project --help 2>/dev/null || echo "No help available"`;
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    
    // Parse from output
    return await parseTemplatesFromHelp(output);
  } catch (error) {
    // Ultimate fallback
    return [
      { name: 'selenium/basic-webdriver', description: 'selenium/basic-webdriver' },
      { name: 'selenium/cucumber-bdd', description: 'selenium/cucumber-bdd' }
    ];
  }
}


