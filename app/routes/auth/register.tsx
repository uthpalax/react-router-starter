import type { Route } from "./+types/register";
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Link, Form } from "react-router"
import { signup, requireAnonymous } from "~/server/auth.server";
import { handleNewSession } from "~/server/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request)
}

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  let email = formData.get("email");
  let password = formData.get("password");
  let username = formData.get("username");
  if (email && password && username && typeof email == "string" && typeof password == "string" && typeof username == "string") {
    const session = await signup({ username, email, password })
    return await handleNewSession({ session, request, redirectTo: '/' })
  }
}

export default function RegisterPage() {
  return (
    <Form method="post" className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-neutral-500 dark:text-neutral-400">
          Enter your email below to register
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" name="username" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" name="password" required />
        </div>
        <Button type="submit" className="w-full">
          Register
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-neutral-200 dark:after:border-neutral-800">
          <span className="relative z-10 bg-white px-2 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">
            Or continue with
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </Form>
  )
}

