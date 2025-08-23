---
allowed-tools: mcp__shrimp-task-manager__plan_task, mcp__shrimp-task-manager__list_tasks, mcp__shrimp-task-manager__update_task, mcp__shrimp-task-manager__query_task, mcp__shrimp-task-manager__get_task_detail
argument-hint: [epic number]
description: Create a Shrimp Task Manager task from a BMAD Epic
---

An example command
Shrimp Task Manager is tool you have access to use. Sometimes it will be referred to just as "Shrimp" for brevity.

The user has supplied the epic number $ARGUMENTS.

1. Read the corresponding epic file `docs/prd/epic-{number}-{description}.md`
2. Use Shrimp to create a task called `Starting Epic {number} {description}`. The implementationGuide for this task is:
   ```
   1. Read the corresponding epic file `docs/prd/epic-{number}-{description}.md`
   2. Validate that each story in the epic file is represented by a task in the Shrimp task list
      - If there are stories with missing tasks, add a new task by following `@.claude/commands/shrimp/create-task-from-bmad-story.md` with the story number as the arguments.
   3. Validate that each story task depends on this epic task
   ```
3. Use Shrimp to create a task called `Completing Epic {number} {description}`. The implementationGuide for this task is:
   ```
   1. Read the corresponding epic file `docs/prd/epic-{number}-{description}.md`
   2. Validate that each story in the epic file is represented by a task in the Shrimp task list
      - If there are stories with missing tasks, add a new task by following `@.claude/commands/shrimp/create-task-from-bmad-story.md` with the story number as the arguments.
      - Make the story task depend on the `Starting Epic {number} {description}` task for this epic
      - Make this `Completing Epic {number} {description}` task depend on the story
   ```
4. Make the `Completing Epic {number} {description}` task of this epic depend on the `Starting Epic {number} {description}` task of this epic
