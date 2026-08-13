#!/usr/bin/env bash
# Bazel credential helper for remote.buildbuddy.io.
#
# Emits the x-buildbuddy-api-key request header from the BUILDBUDDY_API_KEY
# environment variable, so the key never appears on a bazel command line
# (argv leaks into process listings, CI logs, and BEP output).
#
# Wire it host-scoped in .bazelrc, mirroring the estate's gf-reapi helper
# precedent:
#   common:buildbuddy --credential_helper=remote.buildbuddy.io=%workspace%/tools/buildbuddy-credential-helper.sh
#
# The helper protocol: Bazel invokes `<helper> get` with a JSON request on
# stdin and expects a JSON response with a "headers" map on stdout.
set -euo pipefail

if [[ "${1:-}" != "get" ]]; then
  echo "usage: $0 get" >&2
  exit 64
fi

if [[ -z "${BUILDBUDDY_API_KEY:-}" ]]; then
  echo "BUILDBUDDY_API_KEY is not set; refusing to emit empty credentials" >&2
  exit 1
fi

# Consume and discard the request payload on stdin.
cat >/dev/null

printf '{"headers":{"x-buildbuddy-api-key":["%s"]}}\n' "${BUILDBUDDY_API_KEY}"
