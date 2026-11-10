import { AspraApp } from "@/components/aspra/app"
import type { GuestKind } from "@/components/aspra/data"

const kinds = new Set<GuestKind>(["new", "booked", "returning"])

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ guest?: string }>
}) {
  const params = await searchParams
  const guest = params?.guest as GuestKind | undefined
  return <AspraApp initialKind={guest && kinds.has(guest) ? guest : null} />
}
