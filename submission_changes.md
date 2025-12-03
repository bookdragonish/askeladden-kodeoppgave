# Changes added

## Overview
| Task | Area | Summary |
|------|------|---------|
| **Task 1** | Car creation & Vegvesen integration | Fetch car info from Vegvesen when adding a vehicle; update existing car records automatically. |
| **Task 2** | AI suggestions | Generate 2–4 maintenance suggestions using the AI Gateway; remove old suggestions before adding new ones. |
| **Task 3** | Validation, UI improvements, deletions | Add input validation, task sorting & filtering, delete car functionality, and an AI loader animation. |
| **Future Enhancements** | Planning | Styling improvements, task editing, richer task metadata, and overall car status indicators. |
| **AI Declaration** | Transparency | AI tools were used for debugging and accelerating development, but all code was reviewed and understood before being added. |

## Task 1 

Files changed/added:
- [_app.ts](/server/routers/_app.ts): Changed createCar
- [carFromVegvesen](/server/services/carFromVegvesen.ts) Added helper for fetching from the veivesen URL

The implementation will now collect info from vegvesen when the "legg til bil" is clicked. If car exist the fields will update.

Might change later:
- I might add feedback that rapports if fields are updated or new car is added to provide more userfeedback

## Task 2

Files changed:
- [ai.ts](/server/services/ai.ts)
- [_app.ts](/server/routers/_app.ts): Changed fetchAISuggestions to delete the previous suggestions in the database before adding the ai suggested.

Followed this for implementation: https://vercel.com/docs/ai-gateway/openai-compat

## Task 3

### Input validation

This addes user feedback on the *ai suggestion* and *creating task form* and do not allow adding tasks if:
- the task to be added have same name as unfinished task
-  if user already have added 8 tasks marked unfinished this date

See the [validationTaskHelper.ts](/utils/validationTaskHelper.ts) file for helper function.

For the ai feedback I would have prefered it to be a text in the same div as the adding button, however this needed styling and more logic, so I did not prioitize this. There is also no sanitation for preventing bad characters and input, I also did not prioritize this.

### Task browser

Sorting of tasks and task count to make it easier to see the remaining tasks. Used claude.ai for suggestions on styling for the task manager bar.
Files changed:
- [page.tsx (car)](./app/cars/[id]/page.tsx): Tab structure

### Deleting cars

Posibilities of removing cars.
Files changed:
- [schema.ts](./db/schema.ts): Added cascading propperties to avoid errors on removing entries that other tables kept relations to
- [_app.ts](./server/routers/_app.ts): Function for deleting from database added
- [TrashIcon.tsx](./assets/TrashIcon.tsx): Icon
- [page.tsx (home)](./app/page.tsx) Added button with onclick propperties

### Loader

Claude.ai helped creating a fun car loader on the ai call
Files changed:
- [Loader.ts](./assets/Loader.tsx)

## What I would have implemented later:

| Feature | Description |
|--------|-------------|
| **Styling improvements** | With more time I would refine styling. It is time-consuming and doesn't reflect core competence as strongly. |
| **Delete and edit mechanic tasks** | Similar to deleting cars, so not prioritized, but would add the ability to remove or modify tasks. |
| **More task fields** | Add time estimates and pickup deadlines. Prevent creating new tasks if total estimated time exceeds available time before pickup. Time-consuming but a very useful enhancement. |
| **Status per car** | Add an overall car status so the front page can show whether a car is ready for pickup (no pending tasks). |

## AI Declaration
I have used AI to troubleshoot and debug issues, as well as to help generate code to speed up development. However, I have not included any code that I did not fully review and understand before integrating it into the project.

Tools used: [Claude.ai](https://claude.ai) for faster tailwind styling and [Chat GPT](https://chatgpt.com) for debugging 

