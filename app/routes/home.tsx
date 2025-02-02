import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "React router starter" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <div>
    If you are authenticated. You will be redirected here.
    <br />
    <Link to={`/login`}>Login here</Link>
  </div>;
}
