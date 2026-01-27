import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebase"

export interface Activity {
  id?: string
  title: string
  type: "flight" | "hotel" | "restaurant" | "custom"
  date: string
  startTime: string
  endTime: string
  location?: {
    name: string
    lat?: number
    lng?: number
  }
  notes?: string
  order: number
  createdAt?: any
}

const activitiesRef = (tripId: string) =>
  collection(db, "trips", tripId, "activities")

// ---------------- CREATE ----------------
export const createActivity = async (
  tripId: string,
  data: Activity
) => {
  return await addDoc(activitiesRef(tripId), {
    ...data,
    createdAt: serverTimestamp()
  })
}

// ---------------- READ (REAL-TIME) ----------------
export const subscribeActivities = (
  tripId: string,
  callback: (list: Activity[]) => void
) => {
  const q = query(
    activitiesRef(tripId),
    orderBy("date"),
    orderBy("startTime"),
    orderBy("order")
  )

  return onSnapshot(q, snap => {
    const list = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Activity)
    }))
    callback(list)
  })
}

// ---------------- UPDATE ----------------
export const updateActivity = async (
  tripId: string,
  activityId: string,
  data: Partial<Activity>
) => {
  return await updateDoc(
    doc(db, "trips", tripId, "activities", activityId),
    data
  )
}

// ---------------- DELETE ----------------
export const deleteActivity = async (
  tripId: string,
  activityId: string
) => {
  return await deleteDoc(
    doc(db, "trips", tripId, "activities", activityId)
  )
}
