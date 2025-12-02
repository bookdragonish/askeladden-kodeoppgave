import { TaskStatus } from "@/db/schema";

type Task = {
  id: number;
  carId: number;
  title: string;
  description: string | null;
  suggestionId: number | null;
  status: TaskStatus;
  completed: boolean;
  createdAt: string | null;
};

export function validationTaskHelper(  tasks: Task[] | undefined,
  titleToBeCreated: string
): { allowCreate: boolean; feedback: string } {
  
  if (!tasks) {
    return { allowCreate: true, feedback: "" };
  }
      // Checks if there is tasks with the same title that is not completed
      const existSameTitle = tasks?.some(
        (task) => task.title == titleToBeCreated.trim() && !task.completed
      );

      // Check if more than 8 tasks have been added today
      const countTasksToday = tasks?.filter((task) => {
        if (!task.createdAt) return false;
        const d = new Date(task.createdAt);
        const now = new Date();
        return (
          d.getUTCFullYear() === now.getUTCFullYear() &&
          d.getUTCMonth() === now.getUTCMonth() &&
          d.getUTCDate() === now.getUTCDate()
        );
      }).length;

      if(existSameTitle){
        return {allowCreate: false, feedback: "Det finnes en uferdig oppgave med dette navnet"}
      } else if (countTasksToday > 8){
        return {allowCreate: false, feedback: "Du har nådd maksgrensen til antall oppgaver per dag"}
      }
      return { allowCreate: true, feedback: "" };
}