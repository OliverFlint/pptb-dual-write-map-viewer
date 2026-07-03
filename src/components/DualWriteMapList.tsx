import React from "react";
import {
  List,
  ListItem,
  SearchBox,
  Subtitle2,
  Text,
  makeStyles,
} from "@fluentui/react-components";
import { DualWriteMap } from "../hooks/useDataverseApi";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "100%",
    height: "100%",
    maxHeight: "100%",
    gap: "0.75rem",
  },
  search: {
    width: "100%",
  },
  list: {
    overflowX: "auto",
    overflowY: "auto",
    flex: 1,
    maxHeight: "calc(100vh - 200px)",
  },
  selectedItem: {
    backgroundColor: "var(--colorNeutralBackground1Hover)",
    color: "var(--colorNeutralForeground1)",
    borderLeft: "3px solid var(--colorBrandBackground)",
    paddingLeft: "calc(0.5rem - 3px)",
  },
  empty: {
    color: "var(--colorNeutralForeground3)",
    textAlign: "center",
    padding: "3rem 0",
  },
});

export interface DualWriteMapListProps {
  dualwritemaps?: DualWriteMap[];
  onMapSelected?: (data: { dualwritemap: DualWriteMap }) => void;
}

export const DualWriteMapList = (props: DualWriteMapListProps) => {
  const { dualwritemaps } = props;
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | undefined>();

  const filteredMaps = React.useMemo(() => {
    if (!searchQuery.trim()) return dualwritemaps;
    const query = searchQuery.toLowerCase();
    return dualwritemaps?.filter((m) => m.Name.toLowerCase().includes(query));
  }, [dualwritemaps, searchQuery]);

  return (
    <div className={styles.container}>
      <Subtitle2>Dual Write Maps:</Subtitle2>
      <SearchBox
        className={styles.search}
        placeholder="Search maps..."
        value={searchQuery}
        onChange={(_e, newValue) => setSearchQuery(newValue.value)}
        size="small"
      />
      {filteredMaps && filteredMaps.length === 0 && (
        <div className={styles.empty}>
          {searchQuery
            ? "No matches found."
            : "No dual-write maps found in this solution."}
        </div>
      )}
      <List
        className={styles.list}
        selectionMode="single"
        onSelectionChange={(_, data) => {
          const selectedMap = filteredMaps?.find(
            (m) => m.Id === data.selectedItems[0],
          );
          if (selectedMap) {
            setSelectedId(selectedMap.Id);
            if (props.onMapSelected) {
              props.onMapSelected({ dualwritemap: selectedMap });
            }
          }
        }}
      >
        {filteredMaps?.map((m) => (
          <ListItem
            key={m.Id}
            value={m.Id}
            className={m.Id === selectedId ? styles.selectedItem : undefined}
          >
            <Text truncate>{m.Name}</Text>
          </ListItem>
        ))}
      </List>
    </div>
  );
};
