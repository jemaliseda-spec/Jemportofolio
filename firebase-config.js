export const firebaseConfig = {
  apiKey: "AIzaSyDyZozJRTST0M9875cY5WVNt8uXc1bn08s",
  authDomain: "jemeli-owner-dashboard-5b497.firebaseapp.com",
  projectId: "jemeli-owner-dashboard-5b497",
  appId: "jemeli-owner-dashboard-5b497.firebasestorage.app",
  messagingSenderId: "848593341263"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) =>
  typeof value === "string"
  && value.length > 0
  && !value.startsWith("REPLACE_WITH_")
);
