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

For the ai feedback I would have prefered it to be a text in the same div as the adding button, however this needed styling and more logic, so I did not prioitize this.

### Task browser

Sorting of tasks and task count to make it easier to see the remaining tasks. Used claude.ai for suggestions on styling for the task manager bar.


