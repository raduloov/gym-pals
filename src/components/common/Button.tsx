export enum ButtonSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export enum ButtonType {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}

interface Props {
  label: string;
  onClick?: () => void;
  type?: ButtonType;
  size?: ButtonSize;
}

const getSize = (size: ButtonSize) => {
  switch (size) {
    case ButtonSize.SMALL:
      return "text-xs";
    case ButtonSize.MEDIUM:
      return "text-sm";
    case ButtonSize.LARGE:
      return "text-lg";
    default:
      return "text-sm";
  }
};

const defaultValues = {
  type: ButtonType.PRIMARY,
  size: ButtonSize.MEDIUM,
};

export const Button = ({
  label,
  onClick,
  type = defaultValues.type,
  size = defaultValues.size,
}: Props) => {
  switch (type) {
    case ButtonType.PRIMARY:
      return (
        <button
          onClick={onClick}
          className={`rounded-lg bg-blue-700 px-5 py-2.5 ${getSize(
            size
          )} font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
        >
          {label}
        </button>
      );
    case ButtonType.SECONDARY:
      return (
        <button
          onClick={onClick}
          className={`rounded-lg border border-blue-700 px-5 py-2.5 text-center ${getSize(
            size
          )} font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
        >
          {label}
        </button>
      );
    default:
      return (
        <button
          onClick={onClick}
          className={`rounded-lg bg-blue-700 px-5 py-2.5 ${getSize(
            size
          )} font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
        >
          {label}
        </button>
      );
  }
};
