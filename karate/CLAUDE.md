# Claude System Instructions & Developer Guidelines

You are operating within a workspace that strictly utilizes a custom `.claude` directory for memory, task tracking, and prompts. You must adhere to the following architecture and protocols.

## 📁 The `.claude` Directory Structure

All Claude-related operations, logs, and memories are contained within the `.claude/` folder in the project root.

### 1. `prompts/` (Read-Only Task Ingestion)
- This directory contains prompt files created by the user. 
- When the user refers to a prompt or a new task without providing the full text, check this folder first to read the instructions.

### 2. `requests/` (Implementation Verification)
- This directory tracks everything the user has requested to ensure full implementation.
- **Active Tracker:** Maintain a file named `.claude/requests/latest_request.md`. Update this file with new requests and mark off items as they are fully implemented.
- Use this folder to double-check that no feature, edge case, or requirement from a prompt was missed before declaring a task finished.

### 3. `memory/` (Internal Working Context)
- This folder is for your internal thought processes, architecture notes, and rolling context.
- **Active Memory:** Maintain a `.claude/memory/latest_memory.md` file. Keep this updated with your current objective, recently completed steps, and pending technical hurdles.

### 4. `checkpoints/` (State Preservation System)
- **Active Checkpoint:** Maintain a `.claude/checkpoints/latest_checkpoint.md` file to represent the current, unarchived state of the project.
- **Permanent Checkpoints:** Upon completing a major milestone or when asked to "save a checkpoint", you must freeze the current state into a permanent file within this folder.
- **Strict Naming Convention:** `DD-MM-YYYY-hh-mm_checkpoint.md` (e.g., `13-04-2026-12-33_checkpoint.md`). Never use standard Unix epoch timestamps.

### 5. `private/` (⛔ STRICTLY OFF-LIMITS)
- **CRITICAL RULE:** Under NO circumstances are you permitted to read, write, list, or access the `.claude/private/` directory or any files within it. 
- Do not reference its contents, do not execute tools against it, and immediately abort any action that attempts to path into it.

---

## 🛠️ Automated Checkpoint Skill

Whenever it is time to generate a new checkpoint, follow this exact sequence automatically:

1. **Generate the Timestamp:** Use your terminal tools to run `date +"%d-%m-%Y-%H-%M"`.
2. **Read Active State:** Read the current contents of `.claude/checkpoints/latest_checkpoint.md`.
3. **Write Permanent File:** Create the new file in the checkpoints folder using the generated timestamp (e.g., `touch .claude/checkpoints/24-04-2026-22-52_checkpoint.md`) and copy the contents of `latest_checkpoint.md` into it.
4. **Clean Slate:** Update `.claude/checkpoints/latest_checkpoint.md` to reflect that the previous phase is complete and outline the next immediate steps.
5. **Confirmation:** Report back in the chat that the checkpoint skill has been successfully executed and provide the name of the newly created file.