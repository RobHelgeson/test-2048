---
allowed-tools: mcp__shrimp-task-manager__plan_task, mcp__shrimp-task-manager__list_tasks, mcp__shrimp-task-manager__update_task, mcp__shrimp-task-manager__query_task, mcp__shrimp-task-manager__get_task_detail
description: Create a Shrimp Task Manager project from a BMAD prd
---

# Create Shrimp tasks from BMAD stories

This command is used when the user wants to take the stories created by the BMAD method and create tasks in Shrimp Task Manager for each.

Shrimp Task Manager is tool you have access to use. Sometimes it will be referred to just as "Shrimp" for brevity.

## Workflow

1. Discover the epics and create Shrimp tasks for each.
   1. Read the Epic list located in the `@docs/prd/epic-list.md` file.
   2. Each epic has a corresponding epic details file in `docs/prd/epic-{number}-{description}.md`
   3. For each epic, follow the directions in `@.claude/commands/shrimp/create-task-from-bmad-epic.md`
   4. When all epics are created, use Shrimp to map dependencies between the start nodes of epics and the completion nodes of other epics
      - If you are uncertain about the dependencies of the epics on each other, ask the user to define them.
   5. Discover the stories for each epic and create Shrimp tasks for each.
      1. Find the epic details for the current epic file in `docs/prd/epic-{number}-{description}.md`
      2. For each Story found in that file, follow the directions in `@.claude/commands/shrimp/create-task-from-bmad-story.md`
