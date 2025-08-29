---
allowed-tools: mcp__shrimp-task-manager__plan_task, mcp__shrimp-task-manager__list_tasks, mcp__shrimp-task-manager__update_task, mcp__shrimp-task-manager__query_task, mcp__shrimp-task-manager__get_task_detail
argument-hint: [story number]
description: Create a Shrimp Task Manager task from a BMAD Story
---

# Create a Shrimp Task Manager task from a BMAD Story

Shrimp Task Manager is tool you have access to use. Sometimes it will be referred to just as "Shrimp" for brevity.

The user has supplied the story number $ARGUMENTS.
The structure of a story number is {epic number}.{story sequence}

## Workflow

GOAL: Create tasks for all stories, and link them to dependencies.
RESULT: A shrimp task for the story that is linked to the Start and Completion nodes of it's epic and linked to some peer stories.

1. Determine if there already is a task for this story
   - If so, AND the status of the existing task is NOT "pending", return without following the rest of these directions.
   - If not, add a task for this story to the existing plan
2. Set the properties of the task
   - `implementationGuide` =

     ```
     1. Determine if there is a story `docs/stories/{story number}-story.md`
        - If there is not, use a sub‑agent to load the bmad-sm-draft-story agent, pass 'story {story number}' as arguments.
        - If there is, continue to the next step.
     2. If the status of the story is "Draft", update it to "Ready for Development"
     3. If the status of the story is "Ready for Development", use a sub‑agent to load the bmad-dev-develop-story agent, pass 'story {story number}' as arguments.
     4. Read the status of the story (it may have been updated).
     5. If the status of the story is "Ready for Review", use a sub‑agent to load the bmad-qa-review-story agent, pass 'story {story number}' as arguments.
     6. If the QA subagent was happy with the results, update the status of the story to Done
     ```

   - `relatedFiles` = []
   - `verificationCriteria` =

     ```
     The Status of `docs/stories/{story number}-story.md` is Done.
     ```

3. Look at the story sequence,
   - If this is not the first story of the epic (story sequence = 1)
     - Use shrimp to make this story's task depend on the prior story in this epic.
   - Continue with the rest of the steps
4. Use Shrimp to make this story's task depend on the taskId of the `Starting Epic {epic number} {description}` task for this story's epic
5. Use Shrimp to add this story's task's taskId as a dependency on the `Completing Epic {epic number} {description}` task for this story's epic.
   - When using shrimp to add the dependencies
     - You MUST NOT use the task names as the dependencies in the call to update_task
     - You MUST use the taskId of the child tasks in the list of dependencies in the call to update_task
