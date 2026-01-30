#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Paths
const gcdsDocsSource = path.join(__dirname, '../docs/gcds-docs');
const storybookSource = path.join(__dirname, '../docs/storybook');
const docsRoot = path.join(__dirname, '../docs');
const tempBackup = path.join(__dirname, '../.docs-temp-backup');

async function createDeployStructure() {
  try {
    console.log('Creating deployment structure for GitHub Pages...\n');
    
    // Check if sources exist
    if (!fs.existsSync(gcdsDocsSource)) {
      console.error(`ERROR: gcds-docs not found at ${gcdsDocsSource}`);
      console.error('Run "npm run build-pages" first.');
      process.exit(1);
    }
    
    if (!fs.existsSync(storybookSource)) {
      console.error(`ERROR: Storybook not found at ${storybookSource}`);
      console.error('Run "npm run build-pages" first.');
      process.exit(1);
    }

    // Create temp backup of the build artifacts
    console.log('Backing up build artifacts...');
    await fs.ensureDir(tempBackup);
    await fs.copy(gcdsDocsSource, path.join(tempBackup, 'gcds-docs'));
    await fs.copy(storybookSource, path.join(tempBackup, 'storybook'));

    // Clear docs root (but not the hidden folders)
    console.log('Clearing docs root...');
    const items = await fs.readdir(docsRoot);
    for (const item of items) {
      if (item !== '.gitkeep') {
        await fs.remove(path.join(docsRoot, item));
      }
    }

    // Copy gcds-docs content to root
    console.log('Copying gcds-docs to docs root...');
    const gcdsItems = await fs.readdir(path.join(tempBackup, 'gcds-docs'));
    for (const item of gcdsItems) {
      await fs.copy(
        path.join(tempBackup, 'gcds-docs', item),
        path.join(docsRoot, item)
      );
    }

    // Copy storybook to /storybook
    console.log('Copying storybook to docs/storybook/...');
    await fs.copy(
      path.join(tempBackup, 'storybook'),
      path.join(docsRoot, 'storybook')
    );

    // Clean up temp backup
    console.log('Cleaning up...');
    await fs.remove(tempBackup);

    console.log('\n✓ Deployment structure created successfully!');
    console.log('  Structure:');
    console.log('    docs/              <- gcds-docs (root)');
    console.log('    docs/storybook/    <- Storybook');
    console.log('\n  Test locally:');
    console.log('    - Main site: http://localhost:5501/docs/');
    console.log('    - Storybook: http://localhost:5501/docs/storybook/');
    console.log('\n  GitHub Pages URLs (when deployed):');
    console.log('    - Main site: https://yoursite.github.io/');
    console.log('    - Storybook: https://yoursite.github.io/storybook/');
    
  } catch (error) {
    console.error('Error creating deployment structure:', error);
    process.exit(1);
  }
}

createDeployStructure();
