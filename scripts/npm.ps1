# Use the bundled npm CLI when the global npm launcher is broken.
$taskNode = (Get-Command node -ErrorAction Stop).Source
$taskNpm = Join-Path (Split-Path $taskNode) 'node_modules/npm/bin/npm-cli.js'
& $taskNode $taskNpm @args
exit $LASTEXITCODE
