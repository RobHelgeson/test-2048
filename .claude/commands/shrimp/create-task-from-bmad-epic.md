---
allowed-tools: mcp__shrimp-task-manager__plan_task, mcp__shrimp-task-manager__list_tasks, mcp__shrimp-task-manager__update_task, mcp__shrimp-task-manager__query_task, mcp__shrimp-task-manager__get_task_detail
argument-hint: [epic number]
description: Create a Shrimp Task Manager task from a BMAD Epic
---

# Create a Shrimp Task Manager task from a BMAD Story

Shrimp Task Manager is tool you have access to use. Sometimes it will be referred to just as "Shrimp" for brevity.

The user has supplied the epic number $ARGUMENTS.

## Workflow

GOAL: Create and properly link all stories.
RESULT: A shrimp task for the story that is linked to the Start and Completion nodes of it's epic and linked to some peer stories.

1. Read the corresponding epic file `docs/prd/epic-{epic number}-{description}.md`
2. Use Shrimp to add a task called `Starting Epic {epic number} {description}` to the existing plan.
   - The implementationGuide for this task is:

     ```
     1. Read the corresponding epic file `docs/prd/epic-{epic number}-{description}.md` to learn about each story
     2. Validate that each story in the epic file is represented by a task in the Shrimp task list
        - If there are stories with missing tasks, add a new task by following `@.claude/commands/shrimp/create-task-from-bmad-story.md` with the story number as the arguments.
     3. Validate that each story task depends on this epic task
     ```

   - If this epic is not epic number one, use Shrimp to add the prior epic's `Completing Epic {epic number} {description}` taskId as a dependency of this task. This will link the completion of the prior epic to the start of this one.
3. Use Shrimp to add a task called `Completing Epic {epic number} {description}` to the existing plan. The implementationGuide for this task is:

   ```
   1. Read the corresponding epic file `docs/prd/epic-{epic number}-{description}.md` to learn about each story
   2. Validate that each story in the epic file is represented by a task in the Shrimp task list
      - If there are stories with missing tasks, add a new task by following `@.claude/commands/shrimp/create-task-from-bmad-story.md` with the story number as the arguments.
   3. Validate that each story's status is "Done"
      - If it is not, report back, and do not complete the epic task
   ```

4. Make the `Completing Epic {epic number} {description}` task of this epic depend on the `Starting Epic {epic number} {description}` task of this epic
