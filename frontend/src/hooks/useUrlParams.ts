import { useEffect, useState } from "react";

const useUrlParams = () => {
  const [urlPath, setUrlPath] = useState<string[]>([""]);

  const pathAndQuery = window.location.pathname;
  useEffect(() => {
    const constructedPath = pathAndQuery
      .split("%20")
      .join(" ")
      .split("/")
      .slice(1);
    setUrlPath(constructedPath);
  }, [pathAndQuery]);

  return { urlPath, setUrlPath };
};

export default useUrlParams;
