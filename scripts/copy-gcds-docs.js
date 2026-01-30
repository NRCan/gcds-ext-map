#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Paths
const gcdsDocsSite = path.join(__dirname, '../../gcds-docs/_site');
const targetGcdsDocs = path.join(__dirname, '../docs/gcds-docs');

async function copyGcdsDocs() {
  try {
    console.log('Copying gcds-docs _site to docs/gcds-docs...');
    
    // Check if source exists
    if (!fs.existsSync(gcdsDocsSite)) {
      console.error(`ERROR: gcds-docs build not found at ${gcdsDocsSite}`);
      console.error('Please build gcds-docs first.');
      process.exit(1);
    }

    // Clean and create target directory
    await fs.remove(targetGcdsDocs);
    await fs.ensureDir(targetGcdsDocs);

    // Copy entire _site contents to docs/gcds-docs
    console.log(`Copying ${gcdsDocsSite} -> ${targetGcdsDocs}`);
    await fs.copy(gcdsDocsSite, targetGcdsDocs, { overwrite: true });

    console.log('✓ Successfully copied gcds-docs');
    console.log('  - GCDS Docs: docs/gcds-docs/');
    console.log('  - Storybook: docs/storybook/');
    
  } catch (error) {
    console.error('Error copying gcds-docs:', error);
    process.exit(1);
  }
}

copyGcdsDocs();
