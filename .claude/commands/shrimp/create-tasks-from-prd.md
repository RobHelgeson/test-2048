---
allowed-tools: mcp__shrimp-task-manager__plan_task, mcp__shrimp-task-manager__list_tasks, mcp__shrimp-task-manager__update_task, mcp__shrimp-task-manager__query_task, mcp__shrimp-task-manager__get_task_detail
description: Create a Shrimp Task Manager project from a BMAD prd
---

# Create Shrimp tasks from BMAD stories

This command is used when the user wants to take the stories created by the BMAD method and create tasks in Shrimp Task Manager for each.

Shrimp Task Manager is tool you have access to use. Sometimes it will be referred to just as "Shrimp" for brevity.

IMPORTANT: Shrimp Task manager should only **ADD** tasks to the current plan, **NEVER** call `mcp__shrimp-task-manager__clear_all_tasks`.

## Workflow

GOAL: Discover the epics and create Shrimp tasks for each, then create Shrimp tasks for each story in each epic.
RESULT: One overarching Shrimp Task list json with all Epics and Stories loaded

### Steps

1. Read the Epic list located in the `@docs/prd/epic-list.md` file
2. For each epic, follow the directions in `@.claude/commands/shrimp/create-task-from-bmad-epic.md` to **ADD** the epic to the current plan
3. Discover the stories for each epic and create Shrimp tasks for each.
   1. Find the epic details for the current epic file in `docs/prd/epic-{number}-{description}.md`
   2. For each Story found in that file, follow the directions in `@.claude/commands/shrimp/create-task-from-bmad-story.md` to **ADD** the epic to the current plan
