import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "../../db/drizzle";
import { cars, tasks, taskSuggestions, TaskStatus } from "../../db/schema";
import { eq } from "drizzle-orm";
import { generateTaskSuggestions } from "../services/ai";
import { fetchCarInfoFromVegvesen } from "../services/carFromVegvesen";

export const appRouter = router({
  getCars: publicProcedure.query(async () => {
    return await db.select().from(cars);
  }),

  getCarById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const [car] = await db
        .select()
        .from(cars)
        .where(eq(cars.id, input.id))
        .limit(1);
      if (!car) {
        throw new Error("Bil ikke funnet");
      }
      return car;
    }),

  createCar: publicProcedure
    .input(
      z.object({
        regNr: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const regNr = input.regNr.trim().toUpperCase();

      try {
        // Fetch before making new car object
        const info = await fetchCarInfoFromVegvesen(regNr);
        if (info) {
          const [newCar] = await db
            .insert(cars)
            .values({
              regNr: regNr,
              make: info.make,
              model: info.model,
              year: info.year,
              color: info.color,
            })
            .onConflictDoUpdate({
              // TODO: could add feedback so text changes from "added" to "updated if this code runs"
              target: cars.regNr,
              set: {
                make: info.make,
                model: info.model,
                year: info.year ?? 0,
                color: info.color,
              },
            })
            .returning();
          return newCar;
        }
      } catch {
        // console.error("createCar DB error:", err);
        throw new Error("Bil kan ikke hentes fra vegvesen");
      }
    }),

  // Task Suggestions
  getTaskSuggestions: publicProcedure
    .input(z.object({ carId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(taskSuggestions)
        .where(eq(taskSuggestions.carId, input.carId));
    }),

  fetchAISuggestions: publicProcedure
    .input(z.object({ carId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      // Get car information
      const [car] = await db
        .select()
        .from(cars)
        .where(eq(cars.id, input.carId))
        .limit(1);

      if (!car) {
        throw new Error("Bil ikke funnet");
      }

      // Generate AI suggestions
      const suggestions = await generateTaskSuggestions(car);
      console.log(suggestions)

      // If the AI gave suggestions we want to remove previous ones to prevent getting to much info on the page
      // if (suggestions){
      //   await db
      // .delete(taskSuggestions)
      // .where(eq(taskSuggestions.carId, input.carId));
      // }

      // Save suggestions to database
    const insertedSuggestions = await db
      .insert(taskSuggestions)
      .values(
        suggestions.map((suggestion) => ({
          carId: input.carId,
          title: suggestion.title,
          description: suggestion.description,
        }))
      )
      .returning();

      return insertedSuggestions;
    }),

  // Tasks
  getTasks: publicProcedure
    .input(z.object({ carId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await db.select().from(tasks).where(eq(tasks.carId, input.carId));
    }),

  createTask: publicProcedure
    .input(
      z.object({
        carId: z.number().int().positive(),
        title: z.string().min(1),
        description: z.string().optional().nullable(),
        suggestionId: z.number().int().positive().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const [newTask] = await db
        .insert(tasks)
        .values({
          carId: input.carId,
          title: input.title,
          description: input.description ?? null,
          suggestionId: input.suggestionId ?? null,
          status: TaskStatus.PENDING,
          completed: false,
        })
        .returning();

      return newTask;
    }),

  updateTaskStatus: publicProcedure
    .input(
      z.object({
        taskId: z.number().int().positive(),
        status: z.nativeEnum(TaskStatus),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedTask] = await db
        .update(tasks)
        .set({
          status: input.status,
          completed: input.completed ?? input.status === TaskStatus.COMPLETED,
        })
        .where(eq(tasks.id, input.taskId))
        .returning();

      if (!updatedTask) {
        throw new Error("Oppgave ikke funnet");
      }

      return updatedTask;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
