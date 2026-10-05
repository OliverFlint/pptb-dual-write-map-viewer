import { Dropdown, Option } from "@fluentui/react-components";
import { Solution } from "../hooks/useDataverseApi";

export interface SolutionPickerProps {
  solutions: Solution[];
  isConnected: boolean;
  onSolutionSelected?: (data: {
    solutionId: string;
    solutionName: string;
  }) => void;
}

export const SolutionPicker = (props: SolutionPickerProps) => {
  const { solutions } = props;
  return (
    <Dropdown
      id="solution-dropdown"
      placeholder={
        props.isConnected
          ? "Select a solution..."
          : "Connect to a Dataverse environment..."
      }
      style={{ width: "100%", minWidth: "100px" }}
      onOptionSelect={(_, data) => {
        if (props.onSolutionSelected) {
          props.onSolutionSelected({
            solutionId: data.optionValue as string,
            solutionName: data.optionText as string,
          });
        }
      }}
    >
      {solutions.map((s) => (
        <Option key={s.Id} value={s.Id}>
          {`${s.Name} (${s.IsManaged ? "Managed" : "Unmanaged"}) - v${s.Version}`}
        </Option>
      ))}
    </Dropdown>
  );
};
