#!/usr/bin/env node

/**
 * scripts/changelog.js
 *
 * Automated changelog management script for DMOC Web (PWA)
 * Supports adding entries, version bumping, and git integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md');
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

class ChangelogManager {
  constructor() {
    this.changelogContent = this.readChangelog();
    this.packageJson = this.readPackageJson();
  }

  readChangelog() {
    try {
      return fs.readFileSync(CHANGELOG_PATH, 'utf8');
    } catch (error) {
      console.error('Error reading CHANGELOG.md:', error.message);
      process.exit(1);
    }
  }

  readPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    } catch (error) {
      console.error('Error reading package.json:', error.message);
      process.exit(1);
    }
  }

  writeChangelog(content) {
    try {
      fs.writeFileSync(CHANGELOG_PATH, content, 'utf8');
      console.log('✅ CHANGELOG.md updated successfully');
    } catch (error) {
      console.error('Error writing CHANGELOG.md:', error.message);
      process.exit(1);
    }
  }

  writePackageJson(content) {
    try {
      fs.writeFileSync(
        PACKAGE_JSON_PATH,
        JSON.stringify(content, null, 2) + '\n',
        'utf8'
      );
      console.log('✅ package.json updated successfully');
    } catch (error) {
      console.error('Error writing package.json:', error.message);
      process.exit(1);
    }
  }

  getCurrentVersion() {
    return this.packageJson.version;
  }

  bumpVersion(type = 'patch') {
    const version = this.getCurrentVersion();
    const [major, minor, patch] = version.split('.').map(Number);

    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    return newVersion;
  }

  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  addEntry(type, description, category = 'Added') {
    const entry = `- ${description}`;
    const unreleasedSection = '## [Unreleased]';

    if (!this.changelogContent.includes(unreleasedSection)) {
      console.error('❌ [Unreleased] section not found in CHANGELOG.md');
      process.exit(1);
    }

    // Find the category section under [Unreleased]
    const categoryRegex = new RegExp(
      `(## \\[Unreleased\\][\\s\\S]*?)(### ${category}\\n)([\\s\\S]*?)(?=### |## |$)`,
      'g'
    );

    const match = categoryRegex.exec(this.changelogContent);

    if (match) {
      // Category exists, add entry
      const beforeCategory = match[1];
      const categoryHeader = match[2];
      const categoryContent = match[3];

      const newContent = this.changelogContent.replace(
        match[0],
        `${beforeCategory}${categoryHeader}${categoryContent}${entry}\n`
      );

      this.writeChangelog(newContent);
    } else {
      // Category doesn't exist, create it
      const unreleasedRegex = /(## \[Unreleased\]\n)([\s\S]*?)(?=---)/;
      const unreleasedMatch = unreleasedRegex.exec(this.changelogContent);

      if (unreleasedMatch) {
        const beforeUnreleased = unreleasedMatch[1];
        const unreleasedContent = unreleasedMatch[2];

        const newContent = this.changelogContent.replace(
          unreleasedMatch[0],
          `${beforeUnreleased}${unreleasedContent}\n### ${category}\n${entry}\n`
        );

        this.writeChangelog(newContent);
      }
    }

    console.log(`✅ Added ${category.toLowerCase()} entry: ${description}`);
  }

  createVersion(version, type = 'patch') {
    const newVersion = version || this.bumpVersion(type);
    const date = this.getCurrentDate();

    // Update package.json version
    this.packageJson.version = newVersion;
    this.writePackageJson(this.packageJson);

    // Create new version section
    const versionSection = `## [${newVersion}] - ${date}\n\n### Added\n- N/A\n\n### Changed\n- N/A\n\n### Fixed\n- N/A\n\n### Security\n- N/A\n\n### Deprecated\n- N/A\n\n### Removed\n- N/A\n\n---\n\n`;

    // Replace [Unreleased] with new version
    const unreleasedRegex = /## \[Unreleased\][\s\S]*?(?=---)/;
    const newContent = this.changelogContent.replace(
      unreleasedRegex,
      versionSection
    );

    // Add new [Unreleased] section
    const unreleasedSection = `## [Unreleased]\n\n### Added\n- N/A\n\n### Changed\n- N/A\n\n### Fixed\n- N/A\n\n### Security\n- N/A\n\n### Deprecated\n- N/A\n\n### Removed\n- N/A\n\n---\n\n`;

    const finalContent = unreleasedSection + newContent;
    this.writeChangelog(finalContent);

    console.log(`✅ Created version ${newVersion} with date ${date}`);

    // Update version history table
    this.updateVersionHistory(newVersion, date);
  }

  updateVersionHistory(version, date) {
    const versionHistoryRegex =
      /(\| Version \| Date \| Description \|\n\|---------+\|------+\|-------------+\|\n)([\s\S]*?)(\n---)/;
    const match = versionHistoryRegex.exec(this.changelogContent);

    if (match) {
      const tableHeader = match[1];
      const existingEntries = match[2];
      const afterTable = match[3];

      const newEntry = `| ${version} | ${date} | Version ${version} release |\n`;
      const newTable = tableHeader + newEntry + existingEntries + afterTable;

      const newContent = this.changelogContent.replace(match[0], newTable);
      this.writeChangelog(newContent);
    }
  }

  generateFromCommits(since = 'HEAD~10') {
    try {
      const commits = execSync(`git log --oneline ${since}..HEAD`, {
        encoding: 'utf8',
      })
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      if (commits.length === 0) {
        console.log('No new commits found');
        return;
      }

      console.log(`Found ${commits.length} commits since ${since}:`);
      commits.forEach((commit) => console.log(`  ${commit}`));

      // Categorize commits
      const added = [];
      const changed = [];
      const fixed = [];
      const security = [];

      commits.forEach((commit) => {
        const message = commit.toLowerCase();
        if (message.includes('fix') || message.includes('bug')) {
          fixed.push(commit);
        } else if (message.includes('feat') || message.includes('add')) {
          added.push(commit);
        } else if (message.includes('security') || message.includes('vuln')) {
          security.push(commit);
        } else {
          changed.push(commit);
        }
      });

      // Add entries to changelog
      added.forEach((commit) => this.addEntry('feat', commit, 'Added'));
      changed.forEach((commit) => this.addEntry('change', commit, 'Changed'));
      fixed.forEach((commit) => this.addEntry('fix', commit, 'Fixed'));
      security.forEach((commit) =>
        this.addEntry('security', commit, 'Security')
      );

      console.log('✅ Generated changelog entries from git commits');
    } catch (error) {
      console.error('Error generating from commits:', error.message);
    }
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new ChangelogManager();

  switch (command) {
    case 'add':
      if (args.length < 3) {
        console.log(
          'Usage: npm run changelog:add <type> <description> [category]'
        );
        console.log('Types: feat, fix, change, security');
        console.log(
          'Categories: Added, Changed, Fixed, Security, Deprecated, Removed'
        );
        process.exit(1);
      }
      const type = args[1];
      const description = args[2];
      const category = args[3] || 'Added';
      manager.addEntry(type, description, category);
      break;

    case 'version':
      const versionType = args[1] || 'patch';
      const version = args[2];
      manager.createVersion(version, versionType);
      break;

    case 'generate':
      const since = args[1] || 'HEAD~10';
      manager.generateFromCommits(since);
      break;

    case 'current':
      console.log(`Current version: ${manager.getCurrentVersion()}`);
      break;

    default:
      console.log('DMOC Web Changelog Manager');
      console.log('');
      console.log('Usage:');
      console.log(
        '  npm run changelog:add <type> <description> [category]  - Add changelog entry'
      );
      console.log(
        '  npm run changelog:version [type] [version]             - Create new version'
      );
      console.log(
        '  npm run changelog:generate [since]                     - Generate from git commits'
      );
      console.log(
        '  npm run changelog:current                              - Show current version'
      );
      console.log('');
      console.log('Examples:');
      console.log('  npm run changelog:add feat "Add real-time notifications"');
      console.log(
        '  npm run changelog:add fix "Fix manifest loading bug" Fixed'
      );
      console.log('  npm run changelog:version minor');
      console.log('  npm run changelog:generate HEAD~5');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = ChangelogManager;
