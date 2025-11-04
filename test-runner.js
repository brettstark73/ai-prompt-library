#!/usr/bin/env node
/**
 * Comprehensive Test Runner for AI Prompt Library
 * Runs all test types and generates a complete report
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: false, details: '', skipped: false },
      e2e: { passed: false, details: '', skipped: false },
      accessibility: { passed: false, details: '', skipped: true }, // Skip by default since it's not implemented
      visual: { passed: false, details: '', skipped: false },
      lint: { passed: false, details: '', skipped: false },
      format: { passed: false, details: '', skipped: false },
    }
    this.startTime = Date.now()
    this.ranTests = new Set() // Track which tests actually ran
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise(resolve => {
      console.log(`\n🔍 Running: ${command} ${args.join(' ')}`)

      const proc = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout?.on('data', data => {
        stdout += data.toString()
      })

      proc.stderr?.on('data', data => {
        stderr += data.toString()
      })

      proc.on('close', code => {
        resolve({
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        })
      })
    })
  }

  async runUnitTests() {
    console.log('\n📋 Running Unit Tests...')
    this.ranTests.add('unit')
    const result = await this.runCommand('npm', ['run', 'test:unit'])

    this.results.unit.passed = result.code === 0
    this.results.unit.details =
      result.code === 0
        ? '✅ All unit tests passed'
        : `❌ Unit tests failed:\n${result.stderr || result.stdout}`

    return this.results.unit.passed
  }

  async runE2ETests() {
    console.log('\n🌐 Running E2E Tests...')
    this.ranTests.add('e2e')

    // Install Playwright browsers if needed
    await this.runCommand('npx', ['playwright', 'install', '--with-deps'])

    const result = await this.runCommand('npm', ['run', 'test:e2e'])

    this.results.e2e.passed = result.code === 0
    this.results.e2e.details =
      result.code === 0
        ? '✅ All E2E tests passed'
        : `❌ E2E tests failed:\n${result.stderr || result.stdout}`

    return this.results.e2e.passed
  }

  async runLintTests() {
    console.log('\n🔍 Running Lint Tests...')
    this.ranTests.add('lint')
    const result = await this.runCommand('npm', ['run', 'lint'])

    this.results.lint.passed = result.code === 0
    this.results.lint.details =
      result.code === 0
        ? '✅ No linting errors found'
        : `❌ Linting errors found:\n${result.stderr || result.stdout}`

    return this.results.lint.passed
  }

  async runFormatCheck() {
    console.log('\n📝 Checking Code Formatting...')
    this.ranTests.add('format')
    const result = await this.runCommand('npm', ['run', 'format:check'])

    this.results.format.passed = result.code === 0
    this.results.format.details =
      result.code === 0
        ? '✅ Code formatting is correct'
        : `❌ Code formatting issues found:\n${result.stderr || result.stdout}`

    return this.results.format.passed
  }

  async runVisualTests() {
    console.log('\n📸 Running Visual Tests...')
    this.ranTests.add('visual')
    const result = await this.runCommand('npm', ['run', 'test:visual'])

    this.results.visual.passed = result.code === 0
    this.results.visual.details =
      result.code === 0
        ? '✅ Visual tests passed'
        : `❌ Visual tests failed:\n${result.stderr || result.stdout}`

    return this.results.visual.passed
  }

  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2)

    // Only count tests that were actually run or are required (not skipped)
    const relevantTests = Object.entries(this.results).filter(
      ([name, result]) =>
        !result.skipped && (this.ranTests.has(name) || this.ranTests.size === 0)
    )

    const totalTests = relevantTests.length
    const passedTests = relevantTests.filter(
      ([, result]) => result.passed
    ).length
    const passRate =
      totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '100.0'

    const report = `
╔══════════════════════════════════════════════════════════════╗
║                    AI PROMPT LIBRARY TEST REPORT             ║
╠══════════════════════════════════════════════════════════════╣
║ Test Summary:                                                ║
║   Total Test Suites: ${totalTests}                                       ║
║   Passed: ${passedTests}                                                ║
║   Failed: ${totalTests - passedTests}                                                ║
║   Pass Rate: ${passRate}%                                        ║
║   Duration: ${duration}s                                            ║
╠══════════════════════════════════════════════════════════════╣
║ Individual Results:                                          ║
║                                                              ║
║ ${this.results.unit.passed ? '✅' : '❌'} Unit Tests                                         ║
║   ${this.results.unit.details.split('\n')[0]}
║                                                              ║
║ ${this.results.e2e.passed ? '✅' : '❌'} E2E Tests                                           ║
║   ${this.results.e2e.details.split('\n')[0]}
║                                                              ║
║ ${this.results.lint.passed ? '✅' : '❌'} Linting                                           ║
║   ${this.results.lint.details.split('\n')[0]}
║                                                              ║
║ ${this.results.format.passed ? '✅' : '❌'} Code Formatting                                 ║
║   ${this.results.format.details.split('\n')[0]}
║                                                              ║
║ ${this.results.visual.passed ? '✅' : '❌'} Visual Tests                                    ║
║   ${this.results.visual.details.split('\n')[0]}
╠══════════════════════════════════════════════════════════════╣
║ Overall Status: ${passedTests === totalTests ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'}                      ║
╚══════════════════════════════════════════════════════════════╝
`

    console.log(report)

    // Save report to file
    const reportFile = path.join(__dirname, 'test-report.txt')
    fs.writeFileSync(reportFile, report)
    console.log(`\n📄 Detailed report saved to: ${reportFile}`)

    return relevantTests.every(([, result]) => result.passed)
  }

  async runAll() {
    console.log('🚀 Starting Comprehensive Test Suite for AI Prompt Library\n')
    console.log('This will test:')
    console.log('  • Unit Tests (JavaScript logic)')
    console.log('  • E2E Tests (Browser automation)')
    console.log('  • Code Linting (Quality checks)')
    console.log('  • Code Formatting (Style consistency)')
    console.log('  • Visual Tests (UI regression)')

    try {
      // Run tests in parallel where possible
      await Promise.all([
        this.runUnitTests(),
        this.runLintTests(),
        this.runFormatCheck(),
      ])

      // E2E and visual tests need to run after server is available
      await this.runE2ETests()
      await this.runVisualTests()
    } catch (error) {
      console.error('\n❌ Test runner encountered an error:', error.message)
    }

    const allPassed = this.generateReport()

    if (allPassed) {
      console.log(
        '\n🎉 SUCCESS: All tests passed! The application is ready for deployment.'
      )
      process.exit(0)
    } else {
      console.log(
        '\n❌ FAILURE: Some tests failed. Please review the results above.'
      )
      process.exit(1)
    }
  }
}

// CLI handling
const args = process.argv.slice(2)
const testRunner = new TestRunner()

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
AI Prompt Library Test Runner

Usage:
  node test-runner.js [options]

Options:
  --unit          Run only unit tests
  --e2e           Run only E2E tests
  --lint          Run only linting
  --format        Run only format check
  --visual        Run only visual tests
  --help, -h      Show this help message

Examples:
  node test-runner.js                 # Run all tests
  node test-runner.js --unit          # Run only unit tests
  node test-runner.js --e2e --visual  # Run E2E and visual tests
`)
  process.exit(0)
}

// Run specific test types if specified
if (args.length > 0) {
  ;(async () => {
    if (args.includes('--unit')) await testRunner.runUnitTests()
    if (args.includes('--e2e')) await testRunner.runE2ETests()
    if (args.includes('--lint')) await testRunner.runLintTests()
    if (args.includes('--format')) await testRunner.runFormatCheck()
    if (args.includes('--visual')) await testRunner.runVisualTests()

    testRunner.generateReport()
  })()
} else {
  // Run all tests
  testRunner.runAll()
}
