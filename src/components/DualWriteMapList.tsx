import { List, ListItem } from "@fluentui/react-components";
import { DualWriteMap } from "../hooks/useDataverseApi";

export interface DualWriteMapListProps {
  dualwritemaps?: DualWriteMap[];
  onMapSelected?: (data: { dualwritemap: DualWriteMap }) => void;
}

export const DualWriteMapList = (props: DualWriteMapListProps) => {
  const { dualwritemaps } = props;
  return (
    <div style={{ maxWidth: "100%", maxHeight: "100%", height: "90vh" }}>
      <h4>Dual Write Maps:</h4>
      {dualwritemaps && dualwritemaps.length === 0 && (
        <div>No dual-write maps found in this solution.</div>
      )}
      <List
        style={{ overflowX: "auto", overflowY: "hidden", maxHeight: "85vh" }}
        selectionMode="single"
        onSelectionChange={(_, data) => {
          const selectedMap = dualwritemaps?.find(
            (m) => m.Id === data.selectedItems[0],
          );
          if (selectedMap && props.onMapSelected) {
            props.onMapSelected({ dualwritemap: selectedMap });
          }
        }}
      >
        {dualwritemaps?.map((m) => (
          <ListItem key={m.Id} value={m.Id}>
            {m.Name}
          </ListItem>
        ))}
      </List>
    </div>
  );
};
