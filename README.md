# 🗺️ VagaRoute
**Premium Smart Travel Planner & 3D Navigation**

VagaRoute is an all-in-one travel companion designed to simplify the journey from planning to arrival. Built with a clean "White Trip" aesthetic, it combines powerful itinerary management with high-precision GPS navigation.

---

## 📥 Download & Try
Experience VagaRoute on your Android device. Download the latest build directly from our repository:

👉 **[Download VagaRoute v1.0.0 APK](https://expo.dev/artifacts/eas/feLHtSdwmZXyvRV2st5gRR.apk)**

> *Note: Since this is a developer build, you may need to allow "Installation from Unknown Sources" in your Android settings.*

---

## ✨ Key Features

### 📍 Smart 3D Navigation
* **Dynamic Camera:** 65-degree pitched 3D view for better orientation while driving or walking.
* **Real-time Instructions:** Turn-by-turn voice and visual guidance powered by OpenRouteService.
* **Auto-Recenter:** Intelligent tracking that keeps your location centered during movement.

### 📅 Trip Timeline
* **Chronological Planning:** Visual "Thread-line" UI to track flights, hotels, and dinner plans.
* **Smart Icons:** Automatic icon assignment based on activity type (Flight ✈️, Hotel 🏨, Food 🍕).
* **Location Integration:** Quick-view tags for all planned stops.

### 💰 Expense & Budgeting
* **Real-time Tracking:** Log expenses as they happen.
* **Budget Overview:** Visual indicators to show remaining trip funds.

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) + [Expo SDK 51+](https://expo.dev/) |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based) |
| **Maps** | [React Native Maps](https://github.com/react-native-maps/react-native-maps) (Google Maps SDK) |
| **Routing API** | [OpenRouteService](https://openrouteservice.org/) |
| **Styling** | [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) |
| **Persistence** | Firebase Firestore / Expo Secure Store |

---

## 🚀 Getting Started

Follow these steps to set up the development environment on your local machine.

### 1. Prerequisites
* **Node.js:** v18.x or higher
* **npm:** v9.x or higher
* **Expo Go:** Installed on your physical device (iOS/Android)

### 2. Installation
```bash
# Clone the repository
git clone [https://github.com/nisalsahan/VagaRoute.git](https://github.com/nisalsahan/VagaRoute.git)

# Enter project directory
cd VagaRoute

# Install dependencies
npm install