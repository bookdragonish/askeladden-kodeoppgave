# Changes added

## Task 1 

Files changed/added:
- [_app.ts](/server/routers/_app.ts): Changed createCar
- [carFromVegvesen](/server/services/carFromVegvesen.ts) Added helper for fetching from the veivesen URL

The implementation will now collect info from vegvesen when the "legg til bil" is clicked. If car exist the fields will update.

Might change later:
- I might add feedback that checks if fields are updated or new car is added to provide more userfeedback

## Task 2

Files changed:
- [ai.ts](/server/services/ai.ts)
- [_app.ts](/server/routers/_app.ts): Changed fetchAISuggestions to delete the previous suggestions in the database before adding the ai suggested.

Followed thus for implementation: https://vercel.com/docs/ai-gateway/openai-compat

## Task 3

### Input validation

This addes user feedback on the ai suggestion and creating task form if the task to be added have same name as unfinished task or if user already have added 8 tasks.
See the [validationTaskHelper.ts](/utils/validationTaskHelper.ts) file for helper function.

For the ai feedback I would have prefered it to be a text in the same div as the adding button, however this needed styling and more logic, so I did not prioitize this. There is also no sanitation for preventing bad characters and input, I also did not prioritize this.

### Task browser

Sorting of tasks and task count to make it easier to see the remaining tasks. Used claude.ai for suggestions on styling for the task manager bar.

### Deleting cars

Posibilities of removing cars.
Files changes:
- [schema.ts](./db/schema.ts): Added cascading propperties to avoid errors on removing entries that other tables kept relations to
- [_app.ts](./server/routers/_app.ts): Function for deleting from database added
- [TrashIcon.tsx](./assets/TrashIcon.tsx): Icon
- [page.tsx (home)](./app/page.tsx) Added button with onclick propperties

## What I would have implemented later:
- Styling: With more time I would have focused a bit on the styling, however this can be timeconsuming and does not show that much competance.
- Delete and Edit: for the tasks, however implementation is similar to the deleting of cars, so I did not prioritize this
- More fields to each task: Adding timeestimate for each task and deadline for when the person can pick up the car. After this I would have used this to give feedback to creating task so that you cannot create more tasks if carowner will pick up car in 10 hours and timeestimate on total tasks are 10 hours. This is timeconsuming but would have been cool.
- Add status per car so the frontpage could display if the car is ready for pickup (no tasks pending or waiting)
