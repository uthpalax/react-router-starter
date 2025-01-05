import { Link } from "react-router"
import { RegisterForm } from "~/components/register-form"

export default function RegisterPage() {
  return (
    // <RegisterForm />
    <div>register
      <Link
        to="/login">Login</Link>
    </div>
  )
}
