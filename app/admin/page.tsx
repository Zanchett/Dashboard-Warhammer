import { redirect } from "next/navigation"
import AdminPanel from "@/components/AdminPanel"

// This is a placeholder for actual authentication logic
const isAdmin = async () => {
  // Implement your admin check logic here
  return true // For now, always return true
}

export default async function AdminPage() {
  const adminCheck = await isAdmin()

  if (!adminCheck) {
    redirect("/")
  }

  return <AdminPanel />
}
