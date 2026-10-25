---
name: security-audit
description: Perform a read-only security review of application input boundaries, data handling and CI permissions when a security audit is requested.
---
# Security audit
1. Identify the requested scope, trust boundaries and exposed interfaces. Read AGENTS.md, relevant source and workflow files.
2. Trace untrusted data to state changes, logs, shell commands and persistence. Check allowlists, authorization where applicable, secret handling and prototype-key edge cases.
3. Check CI token permissions and whether untrusted PR code can access secrets. Do not execute untrusted fixtures or disclose credentials.
4. Use synthetic proof inputs where safe. Record exact paths and lines. Dependency advisories require current advisory data; an offline review is not an advisory scan.
5. Report severity, exploit preconditions, evidence, impact and recommended fix. Distinguish demonstrated issues from hardening suggestions.
6. Do not modify files or claim the project is secure because no findings were identified. State coverage and limitations.
