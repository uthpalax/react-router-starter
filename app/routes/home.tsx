import { logout } from "~/server/auth.server";
import type { Route } from "./+types/home";
import { Link, Form } from "react-router";
import { Button } from "~/components/ui/Button";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "React router starter" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  return logout({ request });
}

export default function Home() {
  return <div>
    If you are authenticated. You will be redirected here.
    <br />
    <Link to={`/login`}>Login here</Link>
    <Form method="post">
      <Button type="submit">Logout</Button>
    </Form>
  </div>;
}
