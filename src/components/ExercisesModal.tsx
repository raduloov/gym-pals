import { Button, Input, Loading, Modal, Text } from "@nextui-org/react";
import type { WeightliftingExcercise } from "@prisma/client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { CloseSquare } from "react-iconly";

interface Props {
  isSelectingExercises: boolean;
  setIsSelectingExercises: (isSelectingExercises: boolean) => void;
  allExercises: WeightliftingExcercise[];
  handleAddExercise: (exercise: WeightliftingExcercise) => void;
}

const ExercisesModal = ({
  isSelectingExercises,
  setIsSelectingExercises,
  allExercises,
  handleAddExercise,
}: Props) => {
  const ctx = api.useContext();

  const [isAddingNewExercise, setIsAddingNewExercise] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newExerciseName, setNewExerciseName] = useState<string>("");
  const [deletingExerciseId, setDeletingExerciseId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleOnClose = () => {
    setIsSelectingExercises(false);
    setIsAddingNewExercise(false);
    setSearchQuery("");
    setNewExerciseName("");
    setError(null);
  };

  const { mutate: createExercise } = api.exercises.create.useMutation({
    onSuccess: async () => {
      await ctx.exercises.getAll.invalidate();
      setNewExerciseName("");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors;
      if (errorMessage?.title) {
        setError("Please enter an exercise name.");
      } else {
        toast.error("Failed to create exercise! Please try again later.");
      }
    },
  });

  const { mutate: deleteExercise, isLoading: isDeleting } =
    api.exercises.delete.useMutation({
      onSuccess: async () => {
        await ctx.exercises.getAll.invalidate();
        setDeletingExerciseId(null);
        setError(null);
      },
      onError: () => {
        setError("Failed to delete! Please try again later.");
      },
    });

  const handleAddSearchedExercise = (exercise: WeightliftingExcercise) => {
    handleAddExercise(exercise);
    setSearchQuery("");
  };

  const handleAddNewExercise = () => {
    if (!isAddingNewExercise) {
      return setIsAddingNewExercise(true);
    }

    if (newExerciseName.length === 0) {
      return setError("Please enter an exercise name.");
    }

    createExercise({ name: newExerciseName });
    setError(null);
    return setIsAddingNewExercise(false);
  };

  const handleDeleteExercise = (exerciseId: number) => {
    setDeletingExerciseId(exerciseId);
    deleteExercise({ id: exerciseId });
  };

  const filteredExercises = allExercises?.filter((exercise) =>
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderExercises = () => {
    let exercises: WeightliftingExcercise[] = [];

    searchQuery.length === 0
      ? (exercises = allExercises)
      : (exercises = filteredExercises);

    return exercises.map((exercise) => (
      <div
        className="flex cursor-pointer justify-between p-1"
        key={exercise.id}
      >
        <div
          className="w-full"
          onClick={() => handleAddSearchedExercise(exercise)}
        >
          {exercise.title}
        </div>

        <div onClick={() => handleDeleteExercise(exercise.id)}>
          {isDeleting && deletingExerciseId === exercise.id ? (
            <Loading type="spinner" size="sm" />
          ) : (
            <CloseSquare set="curved" size={20} />
          )}
        </div>
      </div>
    ));
  };

  return (
    <Modal
      closeButton
      blur
      open={isSelectingExercises}
      onClose={() => handleOnClose()}
    >
      <Modal.Header>
        <Text id="modal-title" size={18}>
          Choose your next exercise
        </Text>
      </Modal.Header>
      <Modal.Body>
        {!isAddingNewExercise && (
          <>
            <Input
              placeholder="Search for an exercise"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="h-[350px] overflow-y-auto">{renderExercises()}</div>
          </>
        )}
        {isAddingNewExercise && (
          <>
            <Input
              placeholder="New exercise name"
              onChange={(e) => setNewExerciseName(e.target.value)}
            />
            {error && <p className="text-red-500">{error}</p>}
          </>
        )}
      </Modal.Body>
      <Modal.Footer
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          auto
          light
          color="secondary"
          onPress={() => handleAddNewExercise()}
        >
          Add new exercise
        </Button>
        <Button
          auto
          flat
          color="error"
          onPress={() => setIsSelectingExercises(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExercisesModal;
