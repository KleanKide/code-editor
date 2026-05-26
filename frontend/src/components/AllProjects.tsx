import { useEffect, useState } from "react";
import { getProjects, type Project } from "../api/auth";
import { Link } from "react-router-dom";

function AllProject() {
  const [projects, setProject] = useState<Project[]>([]);
  useEffect(() => {
    getProjects()
      .then((userProject) => {
        setProject(() => userProject);
      })
      .catch((err) => console.log(err));
  }, []);
  return (
    <div>
      
      {projects?.map((el) => (
        <Link key={el.id} to={`/projects/${el.id}`}> 
        <p>
          {el.name}
        </p>
        
        </Link>
        
      ))}
    </div>
  );
}

export default AllProject;
