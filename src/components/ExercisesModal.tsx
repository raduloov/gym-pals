import { Button, Input, Modal, Text } from "@nextui-org/react";
import type { WeightliftingExcercise } from "@prisma/client";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        className="cursor-pointer p-1"
        onClick={() => handleAddExercise(exercise)}
        key={exercise.id}
      >
        {exercise.title}
      </div>
    ));
  };

  return (
    <Modal
      closeButton
      blur
      open={isSelectingExercises}
      onClose={() => setIsSelectingExercises(false)}
    >
      <Modal.Header>
        <Text id="modal-title" size={18}>
          Choose your next exercise
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Input
          placeholder="Search for an exercise"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="h-[350px] overflow-y-auto">{renderExercises()}</div>
      </Modal.Body>
      <Modal.Footer>
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
