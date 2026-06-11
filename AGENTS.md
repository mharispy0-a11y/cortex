# AGENTS.md — AI Coding Tool Rules
# Applies to: Claude Code, OpenCode, and any AI coding assistant used in this workspace.

---

## MACHINE CONSTRAINTS

- Windows 11, Intel i5-10210U, 16 GB RAM, integrated Intel UHD GPU (no discrete GPU)
- Keep memory usage low — avoid spinning up multiple heavy services simultaneously
- Prefer CPU-compatible models for local inference (Ollama)
- No GPU-accelerated training or inference assumptions

---

## ABSOLUTE SAFETY RULES

### Protected paths — never read, write, move, rename, or delete:
- D:\AI-Software-House\n8n-data
- D:\AI-Software-House\
- D:\Development\Credentials-Do-Not-Upload\
- D:\Development\GitHub\ai-software-house-core\ (unless a project-specific phase is explicitly approved)
- Any .env file
- Any file named *credentials*, *secret*, *api_key*, *token* (mask if encountered)
- SSH keys (~/.ssh/)
- Browser profiles
- Docker volumes and Docker Desktop internal data
- WSL distributions

### Destructive operations require two steps:
- Step A: dry-run or list exactly what will be affected
- Step B: wait for explicit written user confirmation before executing
- Commands banned without explicit confirmation:
  del, Remove-Item, rm -rf, rd /s, rmdir, format, diskpart,
  docker system prune, docker volume rm, docker container prune

### Never run as Administrator unless explicitly asked.

---

## TERMINAL SAFETY

- Prefer read-only inspection commands first
- Never pipe unknown output into a shell (curl | bash, etc.)
- Never run commands that modify PATH globally without approval
- Never install packages globally without approval
  - Python: always use a project venv (python -m venv .venv)
  - Node: use project-local node_modules, not -g unless approved
  - pip install --user is acceptable; pip install (global) requires approval
- Never run npm install -g, pip install (global), or similar without approval
- Do not start or stop Docker containers/services unless explicitly asked
- Do not touch n8n, its data, or its configuration files

---

## GIT DISCIPLINE

- Always run tests before committing
- One focused change per commit — no bundling unrelated changes
- Commit message format: short imperative summary (under 72 chars)
- Never commit:
  - .env files
  - credentials, API keys, tokens, secrets
  - __pycache__/, *.pyc, .venv/, node_modules/
  - Large binary files unless approved
- Always check git status and git diff --staged before committing
- Never force-push to main or master
- Never amend a published commit without explicit approval
- Never skip pre-commit hooks (--no-verify) without explicit approval
- After each implementation commit, create a separate verification notes commit

---

## WORKFLOW: TEST BEFORE COMMIT

1. Make one focused change
2. Run the relevant test suite
3. Fix any failures before proceeding
4. Stage only the intended files (never git add . blindly)
5. Commit with a clear message
6. Add a verification notes commit documenting what was tested

---

## SECRET EXPOSURE

- Never print, log, or display secrets, API keys, tokens, or passwords
- If a secret is detected in a file, mask it (e.g., sk-ant-****) and warn the user
- Never hardcode credentials — always reference environment variables
- Never suggest storing secrets in source-controlled files
- Always check .gitignore includes .env before any git operation

---

## FRAMEWORK AND STACK DISCIPLINE

- Do not switch frameworks mid-project without explicit approval
- Active AI Software House Core stack (do not change without approval):
  - FastAPI
  - SQLAlchemy
  - SQLite (PostgreSQL later)
  - No authentication yet
  - No frontend yet
  - No n8n integration yet
  - No AI provider calls yet
  - No Alembic unless explicitly approved
- Do not introduce new dependencies without asking first
- Do not add Docker volumes, containers, or compose services without approval
- Do not add Alembic, Celery, Redis, or other infrastructure without approval

---

## DOCUMENTATION REQUIREMENTS

- Add a comment only when the WHY is non-obvious
- Do not write multi-paragraph docstrings for simple functions
- Do not create planning or analysis documents in the repo
- Do not add TODO comments — track work in conversation or task tools instead
- Update README only when a user-visible behavior changes

---

## VERIFICATION NOTES POLICY

After every implementation commit, create a separate commit containing:
- What was implemented
- What tests were run and their results
- Any known edge cases not yet handled
- Any deferred decisions

File: VERIFICATION_NOTES.md (or append to an existing one)

---

## DOCKER RULES

- Never run docker system prune, docker volume rm, or docker container prune
- Never stop or restart the n8n container without explicit approval
- Do not modify docker-compose.yml files without explicit approval
- Do not pull new images without explicit approval
- Checking docker ps (read-only) is acceptable

---

## LIGHTWEIGHT LAPTOP RULES

- Prefer SQLite over PostgreSQL for local development
- Prefer Ollama CPU models (e.g., llama3.2, qwen2.5) over cloud APIs for local testing
- Avoid running multiple heavy services simultaneously (Docker + Ollama + dev server)
- Prefer lightweight test runners (pytest with minimal fixtures)
- Do not run full ML training jobs on this machine

---

## SCOPE CONTROL

- Do not add features, abstractions, or refactors beyond the current task
- Do not design for hypothetical future requirements
- Do not introduce error handling for scenarios that cannot happen
- Do not add feature flags or backwards-compatibility shims
- Implement exactly what was asked — no more, no less
