"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // If not logged in, send back to home
      router.push("/")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p>Loading...</p>
      </main>
    )
  }

  if (!user) return null

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-1">
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-slate-100">
              <Image src="/placeholder-user.jpg" alt="Profile" width={96} height={96} className="h-full w-full object-cover" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">{user.name}</h1>
            <p className="text-slate-600 text-sm">{user.email}</p>
            <Button className="mt-4" variant="outline" onClick={logout}>Logout</Button>
          </div>
        </section>

        <section className="md:col-span-2">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-medium">Saved details</h2>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-slate-500">Full name</dt>
                <dd className="text-sm font-medium text-slate-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="text-sm font-medium text-slate-900">{user.email}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm text-slate-600">This is a demo profile page. Register to customize your name and email.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
