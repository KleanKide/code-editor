import { useEffect, useState } from "react";
import { getOneProject, type Project } from "../api/auth";
import { useParams } from "react-router-dom";

import Editor from "@monaco-editor/react";

const API_URL = import.meta.env.VITE_API_URL;
function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>();
  const [code, setCode] = useState(project?.code);

  useEffect(() => {
    if (!projectId) return;
    getOneProject(projectId)
      .then((userProject) => {
        setProject(userProject);
        setCode(userProject.code);
      })
      .catch((err) => console.log(err));
  }, [projectId]);

  
  function handleChange(value?: string) {
    const nextCode = value ?? "";
    setCode(nextCode);
    fetch(`${API_URL}/projects/${projectId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: nextCode,
      }),
    });
  }
  return (
    <>
      <div>{project?.name}</div>
      <div style={{ height: "100vh" }}>
        <Editor
          height="100vh"
          language="javascript"
          value={code}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

export default ProjectPage;
