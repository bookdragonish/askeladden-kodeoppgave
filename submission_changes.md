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
