# Playwright 102

The three assignment scenarios run against the TestMu AI Selenium Playground:
message echo, mouse-dragging the default-15 slider to 95, and required-field
validation followed by a complete input-form submission. Country is selected
by its visible text, United States.

## Local Execution

Requires Node.js 22 or newer and npm. In Windows PowerShell, use npm.cmd and
npx.cmd if the execution policy blocks the PowerShell shims.

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd test
npm.cmd run report
```

Tests run in parallel. Each run produces an HTML report, JUnit XML, screenshots,
videos, and Playwright traces in playwright-report/ and test-results/.

Chromium reports the native required-field error as "Please fill out this field."
rather than the assignment's "Please fill in this field." The test accepts both
native English variants and checks validity.valueMissing without modifying the
application or generating a substitute validation message.

## HyperExecute Execution

1. Rotate any access key shared in chat. In the HyperExecute dashboard's Secrets
   section, add LT_USERNAME, LT_ACCESS_KEY, and FORM_PASSWORD. FORM_PASSWORD must
   be a disposable test-only value, not a real account password: form interactions
   are recorded in traces and videos.
2. Download the Windows CLI from
   https://downloads.lambdatest.com/hyperexecute/windows/hyperexecute.exe into
   this folder. Verify its digital signature before running it.
3. Configure LT_USERNAME and LT_ACCESS_KEY in your terminal environment. Do not
   put the key in project files or command arguments. One secure PowerShell option:

```powershell
$env:LT_USERNAME = 'kakumaran'
$credential = Get-Credential -UserName $env:LT_USERNAME -Message 'Enter your TestMu AI access key as the password'
$env:LT_ACCESS_KEY = $credential.GetNetworkCredential().Password
.\hyperexecute.exe --config hyperexecute.yaml --download-artifacts --download-artifacts-zip --download-logs
Remove-Item Env:LT_ACCESS_KEY
Remove-Variable credential
```

Enter the key only in the credential prompt, never in chat. The terminal credentials
authenticate the CLI; the dashboard secrets separately populate the cloud workers.
An account with HyperExecute access and at least two available concurrent sessions
is required.

The YAML runs the same three tests on Chrome latest / Windows 10 and Chrome
latest / Linux in parallel. One worker per OS limits the run to two browser
sessions. The remote browser uses the official Playwright WebSocket endpoint,
not Selenium Java ChromeOptions. A tunnel is not needed for this public site.

Required HyperExecute features are configured in hyperexecute.yaml:

- Artifacts Management: per-OS HTML/JUnit reports, screenshots, videos, and traces
  are uploaded. mergeArtifacts combines the environments into a downloadable ZIP
  on the job dashboard; the CLI downloads artifacts and execution logs.
- Secret Management: LT_USERNAME, LT_ACCESS_KEY, and FORM_PASSWORD are injected
  using the HyperExecute secrets syntax. No secret values belong in this repository.
- Environment injection: BASE_URL configures navigation, TEST_MESSAGE supplies
  the echoed message, and FORM_PASSWORD supplies the form's test password. Change
  TEST_MESSAGE in the YAML to exercise a different value without changing tests.
- Pre-steps and caching: npm ci installs locked dependencies using the cached
  .npm directory; the video encoder is installed and cached separately. Caches
  are keyed by the package-lock checksum.

To configure the same values locally, set BASE_URL, TEST_MESSAGE, or FORM_PASSWORD
in the terminal environment before npm.cmd test. Without FORM_PASSWORD, local
tests generate a disposable random test value. Cloud runs require the vault value.

## GitHub Actions

The workflow .github/workflows/hyperexecute.yml submits this repository's
hyperexecute.yaml, not the Java sample discovery configuration. It runs on pushes
to main affecting the suite or workflow, and can also be started manually.

1. In https://github.com/kumaran9676/Playwright102/settings/secrets/actions,
   add repository secrets LT_USERNAME and LT_ACCESS_KEY. Use a rotated access key.
2. CI supplies LT_USERNAME and LT_ACCESS_KEY from GitHub secrets and generates a
   disposable FORM_PASSWORD. It writes all three to a restricted temporary file
   outside the repository and supplies it through --job-secret-file. The YAML
   resolves these job-scoped secrets through its existing secrets references;
   CI deletes the temporary file when the command exits. No separate dashboard
   secret setup is needed for CI. Manual CLI runs still require the dashboard
   vault secrets described above.
3. Publish .github/workflows/hyperexecute.yml and this README to the main branch.
4. Open https://github.com/kumaran9676/Playwright102/actions, select
   "Playwright 102 - HyperExecute", and choose "Run workflow" if a push has not
   already triggered it.
5. Open the "Run the Playwright Windows and Linux matrix" step for the new
   HyperExecute job link. Download the combined artifacts from that job's dashboard
   or the workflow's artifact attachment.

The failed Java-discovery job 1e717749-d9e0-4931-9f98-5f932f34cea1 is historical:
it cannot be converted into a passing run by changing this repository. A new job
must run the actual Playwright tests successfully. The workflow propagates CLI
failures and does not force a green result. Optional post-steps remain omitted.

## Verification Status

Local scenario runs have passed. Cloud execution and the combined downloadable
artifact require authenticated HyperExecute execution; configuration alone is not
proof of a completed cloud run. The GitHub workflow must be published and supplied
with secrets before CI can run. See the GitHub Actions run and its linked
HyperExecute job for the actual execution result. Test failures remain failures
and retain artifacts.
