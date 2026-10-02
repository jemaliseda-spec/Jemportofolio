export const firebaseConfig = {
  apiKey: "REPLACE_WITH_FIREBASE_WEB_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  appId: "REPLACE_WITH_FIREBASE_WEB_APP_ID"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) =>
  typeof value === "string"
  && value.length > 0
  && !value.startsWith("REPLACE_WITH_")
);
