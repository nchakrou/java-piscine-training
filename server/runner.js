import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT_DIR, 'tests');
const UTILITY_DIR = path.join(ROOT_DIR, 'tests_utility');

// Pre-build classpath of all jars in tests_utility
function buildClasspath() {
  const jars = [];
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.isFile() && entry.name.endsWith('.jar')) {
        jars.push(full);
      }
    }
  }
  scan(UTILITY_DIR);
  return jars.join(':');
}

const CLASSPATH = buildClasspath();

function detectPrimaryClassName(code, defaultName) {
  // Look for public class / interface / enum / record
  const match = code.match(/public\s+(?:class|interface|enum|record)\s+([A-Za-z0-9_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Look for non-public class matching defaultName
  const match2 = code.match(/(?:class|interface|enum|record)\s+([A-Za-z0-9_]+)/);
  if (match2 && match2[1]) {
    return match2[1];
  }
  return defaultName;
}

export async function runTestExecution({ challenge, code, isSubmit = false }) {
  const runId = 'run_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
  const tempDir = path.join('/tmp', 'codecrafter_runs', runId);
  const mainJavaDir = path.join(tempDir, 'src', 'main', 'java');
  const testJavaDir = path.join(tempDir, 'src', 'test', 'java');
  const buildMainDir = path.join(tempDir, 'build', 'classes');
  const buildTestDir = path.join(tempDir, 'build', 'test-classes');

  const startTime = Date.now();

  try {
    // 1. Prepare directory structure
    fs.mkdirSync(mainJavaDir, { recursive: true });
    fs.mkdirSync(testJavaDir, { recursive: true });
    fs.mkdirSync(buildMainDir, { recursive: true });
    fs.mkdirSync(buildTestDir, { recursive: true });

    // 2. Write student code
    const className = detectPrimaryClassName(code, challenge.className);
    const studentFile = path.join(mainJavaDir, `${className}.java`);
    fs.writeFileSync(studentFile, code, 'utf-8');

    // 3. Copy runner helpers
    const stopExtSrc = path.join(TESTS_DIR, 'StopAfterFailureExtension.java');
    const runnerSrc = path.join(TESTS_DIR, 'TestRunnerMain.java');
    if (fs.existsSync(stopExtSrc)) {
      fs.copyFileSync(stopExtSrc, path.join(mainJavaDir, 'StopAfterFailureExtension.java'));
    }
    if (fs.existsSync(runnerSrc)) {
      fs.copyFileSync(runnerSrc, path.join(mainJavaDir, 'TestRunnerMain.java'));
    }

    // 4. Copy challenge test files
    const challengeTestFolder = path.join(TESTS_DIR, challenge.testFolder);
    if (fs.existsSync(challengeTestFolder)) {
      const testFiles = fs.readdirSync(challengeTestFolder);
      for (const tf of testFiles) {
        if (tf.endsWith('.java')) {
          fs.copyFileSync(path.join(challengeTestFolder, tf), path.join(testJavaDir, tf));
        } else {
          // Extra resource file if any
          fs.copyFileSync(path.join(challengeTestFolder, tf), path.join(tempDir, tf));
        }
      }
    } else {
      throw new Error(`Test folder for ${challenge.title} not found at ${challengeTestFolder}`);
    }

    // 5. Compile Main Sources
    const mainFiles = fs.readdirSync(mainJavaDir).filter(f => f.endsWith('.java')).map(f => path.join(mainJavaDir, f));
    const compileMainCmd = `javac -cp "${CLASSPATH}" -d "${buildMainDir}" ${mainFiles.map(f => `"${f}"`).join(' ')}`;

    const compileMainResult = await execPromise(compileMainCmd, { cwd: tempDir, timeout: 10000 });
    if (compileMainResult.exitCode !== 0) {
      const durationMs = Date.now() - startTime;
      return {
        status: 'COMPILE_ERROR',
        success: false,
        durationMs,
        testsFound: challenge.totalTests || 0,
        testsSuccessful: 0,
        testsFailed: challenge.totalTests || 0,
        compilerError: cleanCompilerError(compileMainResult.stderr || compileMainResult.stdout, tempDir),
        rawOutput: compileMainResult.stderr || compileMainResult.stdout,
        failures: [{
          testName: 'Compilation',
          message: 'Compilation failed',
          details: cleanCompilerError(compileMainResult.stderr || compileMainResult.stdout, tempDir)
        }]
      };
    }

    // 6. Compile Test Sources
    const testFiles = fs.readdirSync(testJavaDir).filter(f => f.endsWith('.java')).map(f => path.join(testJavaDir, f));
    const compileTestCmd = `javac -cp "${CLASSPATH}:${buildMainDir}" -d "${buildTestDir}" ${testFiles.map(f => `"${f}"`).join(' ')}`;

    const compileTestResult = await execPromise(compileTestCmd, { cwd: tempDir, timeout: 10000 });
    if (compileTestResult.exitCode !== 0) {
      const durationMs = Date.now() - startTime;
      return {
        status: 'COMPILE_ERROR',
        success: false,
        durationMs,
        testsFound: challenge.totalTests || 0,
        testsSuccessful: 0,
        testsFailed: challenge.totalTests || 0,
        compilerError: cleanCompilerError(compileTestResult.stderr || compileTestResult.stdout, tempDir),
        rawOutput: compileTestResult.stderr || compileTestResult.stdout,
        failures: [{
          testName: 'Test Compilation',
          message: 'Interface or method signature mismatch with test suite',
          details: cleanCompilerError(compileTestResult.stderr || compileTestResult.stdout, tempDir)
        }]
      };
    }

    // 7. Execute JUnit TestRunnerMain
    const exitCodeExpected = Math.floor(Math.random() * 100) + 100;
    fs.writeFileSync(path.join(tempDir, '.exit'), String(exitCodeExpected), 'utf-8');

    const runtimeCp = `${CLASSPATH}:${buildMainDir}:${buildTestDir}:${tempDir}`;
    const testClassName = challenge.testClass || `${challenge.className}Test`;
    const runCmd = `java -Xmx256m -Xms32m -cp "${runtimeCp}" TestRunnerMain --select-class "${testClassName}"`;

    const execResult = await execPromise(runCmd, { cwd: tempDir, timeout: 10000 });
    const durationMs = Date.now() - startTime;

    // 8. Parse execution output
    const parsed = parseJunitOutput(execResult.stdout, execResult.stderr, execResult.exitCode, exitCodeExpected, challenge.totalTests);

    return {
      status: parsed.allPassed ? 'VALID' : 'FAILED',
      success: parsed.allPassed,
      durationMs,
      testsFound: parsed.testsFound,
      testsSuccessful: parsed.testsSuccessful,
      testsFailed: parsed.testsFailed,
      testsSkipped: parsed.testsSkipped,
      failures: parsed.failures,
      rawOutput: execResult.stdout + (execResult.stderr ? '\n' + execResult.stderr : '')
    };

  } catch (err) {
    const durationMs = Date.now() - startTime;
    return {
      status: err.killed ? 'TIMEOUT' : 'RUNTIME_ERROR',
      success: false,
      durationMs,
      testsFound: challenge.totalTests || 0,
      testsSuccessful: 0,
      testsFailed: challenge.totalTests || 0,
      compilerError: null,
      rawOutput: err.message,
      failures: [{
        testName: err.killed ? 'Execution Timeout' : 'Runtime Exception',
        message: err.killed ? 'Time Limit Exceeded (max 10 seconds)' : err.message,
        details: err.stack || err.message
      }]
    };
  } finally {
    // Cleanup temp dir
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (ignore) {}
  }
}

function cleanCompilerError(raw, tempDir) {
  if (!raw) return '';
  return raw
    .split('\n')
    .map(line => line.replaceAll(tempDir + '/src/main/java/', '').replaceAll(tempDir + '/src/test/java/', ''))
    .join('\n')
    .trim();
}

function parseJunitOutput(stdout, stderr, exitCode, expectedExitCode, fallbackTotal = 1) {
  const combined = (stdout || '') + '\n' + (stderr || '');
  
  // Parse numbers from JUnit summary:
  // [ 4 tests found ]
  // [ 4 tests successful ]
  // [ 0 tests failed ]
  const foundMatch = combined.match(/\[\s*(\d+)\s+tests found\s*\]/);
  const successfulMatch = combined.match(/\[\s*(\d+)\s+tests successful\s*\]/);
  const failedMatch = combined.match(/\[\s*(\d+)\s+tests failed\s*\]/);
  const skippedMatch = combined.match(/\[\s*(\d+)\s+tests skipped\s*\]/);

  const testsFound = foundMatch ? parseInt(foundMatch[1], 10) : fallbackTotal;
  const testsSuccessful = successfulMatch ? parseInt(successfulMatch[1], 10) : 0;
  const testsFailed = failedMatch ? parseInt(failedMatch[1], 10) : (testsFound - testsSuccessful);
  const testsSkipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;

  const allPassed = (exitCode === expectedExitCode) && (testsFailed === 0) && (testsSuccessful > 0 || testsFound === 0);

  // Parse failure items:
  // Failures:
  //   1) calculateCircleArea_shouldReturnCorrectValue() -> org.opentest4j.AssertionFailedError: ...
  const failures = [];
  const failureSectionMatch = combined.match(/Failures:\s*([\s\S]*?)(?=\n\n|\n\[|$)/);
  if (failureSectionMatch) {
    const rawFailures = failureSectionMatch[1];
    const items = rawFailures.split(/\n\s*\d+\)\s+/).filter(Boolean);
    for (const item of items) {
      const lines = item.trim().split('\n');
      const header = lines[0];
      const details = lines.slice(1).join('\n').trim();
      const parts = header.split(' -> ');
      failures.push({
        testName: parts[0] ? parts[0].trim() : 'Test Failure',
        message: parts[1] ? parts[1].trim() : header,
        details: details || header
      });
    }
  }

  // If failed but no failures parsed, add general failure message
  if (!allPassed && failures.length === 0) {
    failures.push({
      testName: 'Test Assertion Failure',
      message: combined.includes('Exception') ? 'Exception thrown during execution' : 'One or more tests failed assertions',
      details: combined.trim()
    });
  }

  return {
    allPassed,
    testsFound,
    testsSuccessful,
    testsFailed,
    testsSkipped,
    failures
  };
}

function execPromise(command, options) {
  return new Promise((resolve) => {
    exec(command, options, (error, stdout, stderr) => {
      resolve({
        exitCode: error ? (error.code ?? 1) : 0,
        stdout: stdout || '',
        stderr: stderr || '',
        killed: error ? error.killed : false
      });
    });
  });
}
