import { WorkoutTypeClient } from "~/mappers/workoutTypeMapper";

interface Props {
  onSelect: (workoutType: WorkoutTypeClient) => void;
}

interface ButtonProps {
  workoutType: WorkoutTypeClient;
  onSelect: (workoutType: WorkoutTypeClient) => void;
}

export const getWorkoutTypeButtonColorScheme = (
  workoutType: WorkoutTypeClient
) => {
  switch (workoutType) {
    case WorkoutTypeClient.WEIGHTLIFTING:
      return "from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 focus:ring-blue-800";
    case WorkoutTypeClient.COMBAT_SPORTS:
      return "from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 focus:ring-cyan-800";
    case WorkoutTypeClient.WATER_SPORTS:
      return "from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 focus:ring-green-800";
    case WorkoutTypeClient.WINTER_SPORTS:
      return "from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 focus:ring-purple-800";
    case WorkoutTypeClient.CARDIO:
      return "from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 focus:ring-pink-800";
    case WorkoutTypeClient.OTHER:
      return "from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 focus:ring-lime-800";
    default:
      return "";
  }
};

const Button = ({ workoutType, onSelect }: ButtonProps) => {
  return (
    <button
      onClick={() => onSelect(workoutType)}
      className={`${getWorkoutTypeButtonColorScheme(
        workoutType
      )} group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br p-0.5 text-sm font-medium text-white hover:text-white focus:outline-none focus:ring-4`}
    >
      <span className="relative rounded-md bg-gray-900 px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0">
        {`${workoutType}`}
      </span>
    </button>
  );
};

const workoutTypes = [
  WorkoutTypeClient.WEIGHTLIFTING,
  WorkoutTypeClient.COMBAT_SPORTS,
  WorkoutTypeClient.WATER_SPORTS,
  WorkoutTypeClient.WINTER_SPORTS,
  WorkoutTypeClient.CARDIO,
  WorkoutTypeClient.OTHER,
];

export const WorkoutTypesContainer = ({ onSelect }: Props) => {
  return (
    <div className="flex flex-col items-center py-8">
      <span className="pb-8 text-xl">Select workout type:</span>
      <div className="flex flex-wrap justify-center">
        {workoutTypes.map((workoutType) => (
          <Button
            key={workoutType}
            workoutType={workoutType}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};
