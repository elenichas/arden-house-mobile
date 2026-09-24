import { ArdenApp } from "@/components/arden/arden-app"
import type { GuestType } from "@/components/arden/types"

const guestTypes = new Set<GuestType>(["booked", "new", "returning"])

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ guest?: string }>
}) {
  const params = await searchParams
  const guest = params?.guest
  const initialGuestType = guestTypes.has(guest as GuestType)
    ? (guest as GuestType)
    : null

  return <ArdenApp initialGuestType={initialGuestType} />
}
