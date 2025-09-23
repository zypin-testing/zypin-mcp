/**
 * MCP tools implementation for Zypin MCP
 * Minimalist version with 4 core tools: get_available_templates, create_template, how_to_write, how_to_debug
 * 
 * TODO:
 * - Add template validation before creation
 * - Improve error messages with specific CLI command suggestions
 * - Add support for custom template parameters
 */

import { createPlaywrightTools } from './tools-playwright.js';

export function createTools(browser) {
  const playwrightTools = createPlaywrightTools(browser);

  return [
    ...playwrightTools,

    // 1. Get Available Templates
    {
      name: 'get_available_templates',
      description: 'Get list of available Zypin templates',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async () => {
        const { execSync } = await import('child_process');

        const command = `zypin create-project --help`;
        const helpOutput = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

        const templates = parseTemplatesFromHelp(helpOutput);

        return {
          success: true,
          message: `📋 Available Templates:\n${templates.map((t, i) => `${i + 1}. ${t.name} - ${t.description}`).join('\n')}`,
          templates: templates
        };
      }
    },

    // 2. Create Template
    {
      name: 'create_template',
      description: 'Create a new test project from template',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Project name' },
          template: { type: 'string', description: 'Template name (e.g., selenium/cucumber-bdd)' },
          workingDirectory: { type: 'string', description: 'Directory to create project in' }
        },
        required: ['projectName', 'template', 'workingDirectory']
      },
      handler: async ({ projectName, template, workingDirectory }) => {
        const { execSync } = await import('child_process');
        const path = await import('path');

        const command = `zypin create-project ${projectName} --template ${template} --force`;
        execSync(command, { stdio: 'pipe', cwd: workingDirectory });

        return {
          success: true,
          message: `✅ Project "${projectName}" created with template ${template}`,
          projectPath: path.default.join(workingDirectory, projectName),
          nextSteps: [
            `cd ${projectName}`,
            'npm install'
          ]
        };
      }
    },

    // 3. How to Write
    {
      name: 'how_to_write',
      description: 'Get writing guide for current project template',
      inputSchema: {
        type: 'object',
        properties: {
          workingDirectory: { type: 'string', description: 'Project directory path' }
        },
        required: ['workingDirectory']
      },
      handler: async ({ workingDirectory }) => {
        const { execSync } = await import('child_process');

        const command = `zypin guide --write`;
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: workingDirectory });

        return {
          success: true,
          message: `📚 Writing Guide`,
          content: output
        };
      }
    },

    // 4. How to Debug
    {
      name: 'how_to_debug',
      description: 'Get debugging guide for current project template',
      inputSchema: {
        type: 'object',
        properties: {
          workingDirectory: { type: 'string', description: 'Project directory path' }
        },
        required: ['workingDirectory']
      },
      handler: async ({ workingDirectory }) => {
        const { execSync } = await import('child_process');

        const command = `zypin guide --debugging`;
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: workingDirectory });

        return {
          success: true,
          message: `🐛 Debugging Guide`,
          content: output
        };
      }
    },

    // 5. Get Template README
    {
      name: 'get_template_readme',
      description: 'Get README guide for current project template',
      inputSchema: {
        type: 'object',
        properties: {
          workingDirectory: { type: 'string', description: 'Project directory path' }
        },
        required: ['workingDirectory']
      },
      handler: async ({ workingDirectory }) => {
        const { execSync } = await import('child_process');

        const command = `zypin guide --readme`;
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe', cwd: workingDirectory });

        return {
          success: true,
          message: `📖 Template README`,
          content: output
        };
      }
    }
  ];
}

// Helper function to parse templates from help output
function parseTemplatesFromHelp(helpOutput) {
  const lines = helpOutput.split('\n');
  const templates = [];
  let inTemplateSection = false;

  for (const line of lines) {
    if (line.includes('Available Templates:') || line.includes('📋 Available Templates:')) {
      inTemplateSection = true;
      continue;
    }

    if (inTemplateSection && (line.includes('Usage Examples:') || line.includes('💡 Usage Examples:'))) {
      break;
    }

    if (inTemplateSection) {
      const templateMatch = line.match(/●\s+(\w+)\/([\w-]+)/);
      if (templateMatch) {
        const packageName = templateMatch[1];
        const templateName = templateMatch[2];
        const fullName = `${packageName}/${templateName}`;

        let description = fullName;
        const descMatch = line.match(/●\s+\w+\/[\w-]+\s+(.+)/);
        if (descMatch) {
          description = descMatch[1].trim();
        }

        templates.push({
          name: fullName,
          description: description
        });
      }
    }
  }

  return templates;
}