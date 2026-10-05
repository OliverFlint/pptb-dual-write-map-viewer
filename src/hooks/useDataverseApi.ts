import { useEffect, useState } from "react";
import { useEventLog } from "./useToolboxAPI";

export type Solution = {
  Id: string;
  Name: string;
  UniqueName: string;
  Version: string;
  IsManaged: boolean;
};

export type DualWriteMap = {
  Id: string;
  Name: string;
  Mapping: string;
};

export const useSolutionList = (
  enabled: boolean,
  connectionId: string | undefined,
  refreshKey: number,
) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { addLog } = useEventLog();

  useEffect(() => {
    if (!enabled) {
      setSolutions([]);
      setIsLoading(false);
      setMessage("");
      setError("");
      return;
    }

    setIsLoading(true);
    setMessage("Loading solutions...");
    setError("");
    window.dataverseAPI
      .getSolutions(
        ["solutionid", "uniquename", "friendlyname", "version", "ismanaged"],
        "primary",
      )
      .then((response) => {
        setSolutions(
          response.value
            .map((s: any) => {
              return {
                Id: s.solutionid,
                Name: s.friendlyname,
                UniqueName: s.uniquename,
                Version: s.version,
                IsManaged: s.ismanaged,
              } as Solution;
            })
            .sort((a: Solution, b: Solution) => a.Name.localeCompare(b.Name)),
        );
      })
      .catch((error) => {
        const detail = error instanceof Error ? error.message : String(error);
        const friendlyMessage = detail.includes("No connection found")
          ? "ToolBox could not find a connection for this tool. Close and reopen the tool with a Dataverse environment selected."
          : `Could not load solutions: ${detail}`;
        setError(friendlyMessage);
        addLog("Error fetching solutions: " + detail, "error");
      })
      .finally(() => {
        setIsLoading(false);
        setMessage("");
      });
  }, [enabled, connectionId, refreshKey]);

  return { solutions, isLoading, message, error };
};

export const useDualWriteMaps = (solutionId?: string) => {
  const [maps, setMaps] = useState<DualWriteMap[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { addLog } = useEventLog();

  useEffect(() => {
    if (!solutionId) {
      setMaps(undefined);
      setIsLoading(false);
      setMessage("");
      setError("");
      return;
    }

    setIsLoading(true);
    setMessage("Loading dual write maps...");
    setError("");
    window.dataverseAPI
      .queryData(
        `msdyn_dualwriteentitymaps?$select=msdyn_dualwriteentitymapid,msdyn_displayname,msdyn_mapping,solutionid&$filter=solutionid eq ${solutionId}`,
        "primary",
      )
      .then((response) => {
        setMaps(
          response.value.map(
            (m: any) =>
              ({
                Id: m.msdyn_dualwriteentitymapid,
                Name: m.msdyn_displayname,
                Mapping: m.msdyn_mapping,
              }) as DualWriteMap,
          ),
        );
      })
      .catch((error) => {
        const detail = error instanceof Error ? error.message : String(error);
        const friendlyMessage = detail.includes("No connection found")
          ? "ToolBox could not find a connection for this tool. Close and reopen the tool with a Dataverse environment selected."
          : `Could not load Dual Write maps: ${detail}`;
        setError(friendlyMessage);
        addLog("Error fetching dual write maps: " + detail, "error");
      })
      .finally(() => {
        setIsLoading(false);
        setMessage("");
      });
  }, [solutionId]);

  return { maps, isLoading, message, error };
};
