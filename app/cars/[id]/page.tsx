"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TaskStatus } from "@/db/schema";
import { validationTaskHelper } from "@/utils/validationTaskHelper";
import Loader from "@/assets/Loader";

type TaskFilter = "alle" | "venter" | "pågår" | "fullført";

export default function CarPage() {
  const { id } = useParams() as { id: string };
  const carId = Number(id);

  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [feedbackTaskForm, setFeedbackTaskForm] = useState("");
  const [feedbackSuggested, setFeedbackSuggested] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("alle");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const {
    data: car,
    isLoading,
    error,
  } = trpc.getCarById.useQuery({ id: carId });

  const { data: suggestions, refetch: refetchSuggestions } =
    trpc.getTaskSuggestions.useQuery({ carId }, { enabled: !!carId });

  const { data: tasks, refetch: refetchTasks } = trpc.getTasks.useQuery(
    { carId },
    { enabled: !!carId }
  );

  // Filtering for task tabs
  const filteredTasks = tasks?.filter((task) => {
    if (taskFilter === "alle") return true;
    if (taskFilter === "venter") return task.status === TaskStatus.PENDING;
    if (taskFilter === "pågår") return task.status === TaskStatus.IN_PROGRESS;
    if (taskFilter === "fullført") return task.status === TaskStatus.COMPLETED;
    return true;
  });

  const fetchAISuggestions = trpc.fetchAISuggestions.useMutation({
    onSuccess: () => {
      refetchSuggestions();
      setFeedbackSuggested("");
    },
  });

  const createTask = trpc.createTask.useMutation({
    onSuccess: () => {
      setTaskTitle("");
      setTaskDescription("");
      setShowCreateTaskForm(false);
      setFeedbackTaskForm("");
      refetchTasks();
    },
  });

  const updateTaskStatus = trpc.updateTaskStatus.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });

  const handleCreateTaskFromSuggestion = (suggestionId: number) => {
    setFeedbackSuggested("");

    const suggestion = suggestions?.find((s) => s.id === suggestionId);
    if (!suggestion) return;

    const { allowCreate, feedback } = validationTaskHelper(
      tasks,
      suggestion.title
    );

    if (allowCreate) {
      createTask.mutate({
        carId,
        title: suggestion.title,
        description: suggestion.description ?? undefined,
        suggestionId,
      });
    } else {
      setFeedbackSuggested(feedback);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackTaskForm("");

    const trimmedTitle = taskTitle.trim();
    const trimmedDescription = taskDescription.trim();

    const { allowCreate, feedback } = validationTaskHelper(tasks, trimmedTitle);

    if (allowCreate) {
      createTask.mutate({
        carId,
        title: trimmedTitle,
        description: trimmedDescription || undefined,
      });
    } else {
      setFeedbackTaskForm(feedback);
    }
  };

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateTaskStatus.mutate({
      taskId,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <div className="p-8 text-center text-gray-600">
          Laster bildetaljer...
        </div>
      </main>
    );
  }

  if (error || !car) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <div className="p-8 bg-red-50 text-red-600 rounded-lg mb-4">
          <p className="m-0 mb-4">{error?.message || "Bil ikke funnet"}</p>
          <Link href="/" className="text-blue-600 underline">
            ← Tilbake til biliste
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Link href="/" className="inline-block mb-8 text-blue-600 no-underline">
        ← Tilbake til biliste
      </Link>

      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <h1 className="text-2xl mb-8">Bildetaljer</h1>

        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              Registreringsnummer
            </div>
            <div className="text-2xl font-bold">{car.regNr}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              Merke
            </div>
            <div className="text-xl font-medium">{car.make}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              Modell
            </div>
            <div className="text-xl font-medium">{car.model}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              År
            </div>
            <div className="text-xl">{car.year}</div>
          </div>

          {car.color && (
            <div>
              <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
                Farge
              </div>
              <div className="text-xl">{car.color}</div>
            </div>
          )}

          {car.createdAt && (
            <div>
              <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
                Lagt til i register
              </div>
              <div className="text-base text-gray-600">
                {new Date(car.createdAt).toLocaleString("no-NO")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Suggestions Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Oppgaveforslag</h2>
          <button
            onClick={() => fetchAISuggestions.mutate({ carId })}
            disabled={fetchAISuggestions.isPending}
            className="px-4 py-2 text-sm bg-purple-600 text-white border-none rounded whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700 transition-colors"
          >
            {fetchAISuggestions.isPending
              ? "Henter forslag..."
              : "Hent AI-forslag"}
          </button>
        </div>

        {fetchAISuggestions.error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
            <p className="m-0">Feil: {fetchAISuggestions.error.message}</p>
          </div>
        )}

        {fetchAISuggestions.isPending ? (
          <Loader />
        ) : !suggestions || suggestions.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
            Ingen forslag ennå. Klikk på &quot;Hent AI-forslag&quot; for å
            generere forslag.
          </div>
        ) : (
          <div className="grid gap-3">
            {feedbackSuggested && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">
                Feil: {feedbackSuggested}
              </div>
            )}
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {suggestion.title}
                  </h3>
                  {suggestion.description && (
                    <p className="text-gray-600 m-0">
                      {suggestion.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCreateTaskFromSuggestion(suggestion.id)}
                  disabled={createTask.isPending}
                  className="px-4 py-2 text-sm bg-purple-600 text-white border-none rounded whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  Opprett oppgave
                </button>
              </div>
            ))}
          </div>
        )}




      </section>

      {/* Form */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Oppgaver</h2>
          <button
            onClick={() => {
              setShowCreateTaskForm((prev) => !prev);
              setFeedbackTaskForm("");
              setTaskTitle("");
              setTaskDescription("");
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white border-none rounded whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
          >
            {showCreateTaskForm ? "Avbryt" : "+ Opprett oppgave"}
          </button>
        </div>

        {showCreateTaskForm && (
          <form
            onSubmit={handleCreateTask}
            className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="mb-4">
              <label
                htmlFor="task-title"
                className="block text-sm font-medium mb-2"
              >
                Tittel *
              </label>
              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                disabled={createTask.isPending}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded"
                placeholder="F.eks. Service"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="task-description"
                className="block text-sm font-medium mb-2"
              >
                Beskrivelse
              </label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                disabled={createTask.isPending}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded"
                placeholder="Beskrivelse av oppgaven..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createTask.isPending || !taskTitle.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white border-none rounded disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-blue-700 transition-colors"
              >
                {createTask.isPending ? "Oppretter..." : "Opprett oppgave"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateTaskForm(false);
                  setFeedbackTaskForm("");
                  setTaskTitle("");
                  setTaskDescription("");
                }}
                className="px-4 py-2 text-sm bg-gray-300 text-gray-700 border-none rounded cursor-pointer hover:bg-gray-400 transition-colors"
              >
                Avbryt
              </button>
            </div>
            {(createTask.error || feedbackTaskForm) && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">
                Feil: {createTask.error?.message} {feedbackTaskForm}
              </div>
            )}
          </form>
        )}

        {/* Filter Tabs */}

        <div className="mb-4 flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setTaskFilter("alle")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              taskFilter === "alle"
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            Alle {tasks?.length ? `(${tasks.length})` : ""}
          </button>
          <button
            onClick={() => setTaskFilter("venter")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              taskFilter === "venter"
                ? "border-gray-600 text-gray-800 bg-gray-50"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            Venter
            {tasks &&
              tasks.filter((t) => t.status === TaskStatus.PENDING).length > 0 &&
              ` (${
                tasks.filter((t) => t.status === TaskStatus.PENDING).length
              })`}
          </button>
          <button
            onClick={() => setTaskFilter("pågår")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              taskFilter === "pågår"
                ? "border-yellow-600 text-yellow-800 bg-yellow-50"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            Pågår
            {tasks &&
              tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length >
                0 &&
              ` (${
                tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
              })`}
          </button>
          <button
            onClick={() => setTaskFilter("fullført")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              taskFilter === "fullført"
                ? "border-green-600 text-green-700 bg-green-50"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            Fullført
            {tasks &&
              tasks.filter((t) => t.status === TaskStatus.COMPLETED).length >
                0 &&
              ` (${
                tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
              })`}
          </button>
        </div>

        {!tasks || tasks.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
            Ingen oppgaver ennå. Opprett en oppgave eller konverter et forslag
            til oppgave.
          </div>
        ) : !filteredTasks || filteredTasks.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
            Ingen oppgaver med status &quot{taskFilter}&quot.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg ${
                  task.status === TaskStatus.COMPLETED
                    ? "bg-green-50 border-green-200"
                    : task.status === TaskStatus.IN_PROGRESS
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 m-0 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        Status:{" "}
                        <span className="font-medium">
                          {task.status === TaskStatus.PENDING
                            ? "Venter"
                            : task.status === TaskStatus.IN_PROGRESS
                            ? "Pågår"
                            : "Fullført"}
                        </span>
                      </span>
                      {task.createdAt && (
                        <span>
                          Opprettet:{" "}
                          {new Date(task.createdAt).toLocaleString("no-NO", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      handleStatusChange(task.id, TaskStatus.PENDING)
                    }
                    disabled={
                      updateTaskStatus.isPending ||
                      task.status === TaskStatus.PENDING
                    }
                    className={`px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                      task.status === TaskStatus.PENDING
                        ? "bg-gray-200 text-gray-700 border-gray-300"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Venter
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(task.id, TaskStatus.IN_PROGRESS)
                    }
                    disabled={
                      updateTaskStatus.isPending ||
                      task.status === TaskStatus.IN_PROGRESS
                    }
                    className={`px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                      task.status === TaskStatus.IN_PROGRESS
                        ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-yellow-50"
                    }`}
                  >
                    Pågår
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(task.id, TaskStatus.COMPLETED)
                    }
                    disabled={
                      updateTaskStatus.isPending ||
                      task.status === TaskStatus.COMPLETED
                    }
                    className={`px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                      task.status === TaskStatus.COMPLETED
                        ? "bg-green-200 text-green-800 border-green-300"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                    }`}
                  >
                    Fullført
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
