---
allowed-tools: mcp__shrimp-task-manager__plan_task, mcp__shrimp-task-manager__list_tasks, mcp__shrimp-task-manager__update_task, mcp__shrimp-task-manager__query_task, mcp__shrimp-task-manager__get_task_detail
argument-hint: [story number]
description: Create a Shrimp Task Manager task from a BMAD Story
---

Shrimp Task Manager is tool you have access to use. Sometimes it will be referred to just as "Shrimp" for brevity.

The user has supplied the story number $ARGUMENTS.

1. Determine if there already is a task for this story
   - If so, AND the status of the existing task is NOT "pending", return without following the rest of these directions.
   - If not, create a task for this story
2. Set the properties of the task
   - `implementationGuide` =
     ```
     1. Use a sub‑agent to load the BMAD-sm-draft agent, pass 'story {story number}' as arguments.
     2. Use a sub‑agent to load the BMAD-dev-develop-story agent, pass 'story {story number}' as arguments.
     3. Use a sub‑agent to load the BMAD-qa-review agent, pass 'story {story number}' as arguments.
     ```
   - `relatedFiles` = []
   - `verificationCriteria` =
     ```
     The Status of `docs/stories/{story number}-story.md is Complete.
     ```
3. If this is not the first story of the epic, use shrimp to make the story's task depend on the prior story in the epic.
4. Use Shrimp to make this story's task depend on the `Starting Epic {number} {description}` task for this story's epic
5. Use Shrimp to make the `Completing Epic {number} {description}` task for this story's epic depend on this story's task
