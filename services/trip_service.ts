import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "@/services/firebase";

/* =======================
   Types
======================= */

export interface Trip {
  id?: string;
  title: string;
  startPoint: string;
  endPoint: string;
  startDate: string;
  endDate: string;
  stops: string[]; // Multiple stops
  userId: string;
  createdAt?: any;
}

/* =======================
   Create Trip
======================= */
export const createTrip = async (tripData: Omit<Trip, "id" | "createdAt" | "userId">) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const payload: Trip = {
      ...tripData,
      userId: user.uid,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "Trips"), payload);
    return docRef.id;
  } catch (error) {
    console.error("Create trip failed:", error);
    throw error;
  }
};

/* =======================
   Get My Trips
======================= */
export const getMyTrips = async (): Promise<Trip[]> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const q = query(
      collection(db, "Trips"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Trip)
    }));
  } catch (error) {
    console.error("Fetch trips failed:", error);
    throw error;
  }
};
