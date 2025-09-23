/**
 * MCP tools implementation for Zypin MCP
 * Minimalist version with 3 core tools: get_zypin_templates, create_zypin_template, get_template_info
 * 
 * TODO:
 * - Add template validation before creation
 * - Improve error messages with specific CLI command suggestions
 * - Add support for custom template parameters
 */

import { createPlaywrightTools } from './tools-playwright.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import templateScanner from 'zypin-core/core/template-scanner.js';

export function createTools(browser) {
  const playwrightTools = createPlaywrightTools(browser);

  return [
    ...playwrightTools,

    // 1. Get Zypin Templates
    {
      name: 'get_zypin_templates',
      description: 'Get available Zypin templates with descriptions',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: () => {
        const templates = templateScanner.getTemplates();
        
        const result = [];
        for (const template of templates) {
          const packagePath = path.join(template.path, 'package.json');
          if (fs.existsSync(packagePath)) {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            result.push({
              name: template.namespacedName,
              description: pkg.description || template.name
            });
          }
        }
        
        return {
          message: `📋 Available Templates:\n${result.map((t, i) => `${i + 1}. ${t.name} - ${t.description}`).join('\n')}`,
          templates: result
        };
      }
    },

    // 2. Create Zypin Template
    {
      name: 'create_zypin_template',
      description: 'Create new project from Zypin template',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Project name' },
          template: { type: 'string', description: 'Template name (e.g., selenium/cucumber-bdd)' },
          workingDirectory: { type: 'string', description: 'Directory to create project in' }
        },
        required: ['projectName', 'template', 'workingDirectory']
      },
      handler: ({ projectName, template, workingDirectory }) => {
        const command = `zypin create-project ${projectName} --template ${template} --force`;
        const result = execSync(command, { stdio: 'pipe', cwd: workingDirectory, encoding: 'utf8' });

        return {
          message: result,
          projectPath: path.join(workingDirectory, projectName),
          nextSteps: [`cd ${projectName}`, 'npm install'],
          guidance: {
            write: 'zypin guide --write',
            debug: 'zypin guide --debug'
          }
        };
      }
    },

    // 3. Get Template Info
    {
      name: 'get_template_info',
      description: 'Get detailed information about a specific template',
      inputSchema: {
        type: 'object',
        properties: {
          template: { type: 'string', description: 'Template name (e.g., selenium/cucumber-bdd)' }
        },
        required: ['template']
      },
      handler: ({ template }) => {
        const templates = templateScanner.getTemplates();
        const foundTemplate = templates.find(t => t.name === template);
        
        if (!foundTemplate) {
          throw new Error(`Template "${template}" not found`);
        }

        const readmePath = path.join(foundTemplate.path, 'README.md');
        if (!fs.existsSync(readmePath)) {
          throw new Error(`README.md not found for template "${template}"`);
        }

        const content = fs.readFileSync(readmePath, 'utf8');
        return {
          message: `📖 Template Info: ${template}`,
          content: content
        };
      }
    }
  ];
}