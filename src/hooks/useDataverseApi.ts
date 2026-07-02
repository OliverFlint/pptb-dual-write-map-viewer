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

export const useSolutionList = (deps: React.DependencyList) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { addLog } = useEventLog();

  useEffect(() => {
    setIsLoading(true);
    setMessage("Loading solutions...");
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
        addLog("Error fetching solutions: " + error.message, "error");
      })
      .finally(() => {
        setIsLoading(false);
        setMessage("");
      });
  }, deps);

  return { solutions, isLoading, message };
};

export const useDualWriteMaps = (solutionId?: string) => {
  const [maps, setMaps] = useState<DualWriteMap[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { addLog } = useEventLog();

  useEffect(() => {
    setIsLoading(true);
    setMessage("Loading dual write maps...");
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
        addLog("Error fetching dual write maps: " + error.message, "error");
      })
      .finally(() => {
        setIsLoading(false);
        setMessage("");
      });
  }, [solutionId]);

  return { maps, isLoading, message };
};
