import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, remove, onValue, push, ref, serverTimestamp } from 'firebase/database';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASEURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
});

export const database = getDatabase(app);
export const auth = getAuth(app);

export function authChanged(cb = () => {}) {
  onAuthStateChanged(auth, (user) => {
    cb(user)
  });
}

export function writeProject({ userId, name }) {
  const path = ref(database, `/workSpace-${userId}/projects`)
  return push(path, {
    name,
    date: serverTimestamp(),
  })
}

export const readProjects = async (userId, cb = () => {}) => {
  const path = ref(database, `/workSpace-${userId}/projects`)
  onValue(
    path,
    (snapshot) => {
      let tmpProjects = [];
      if (snapshot.val()) {
        Object.entries(snapshot.val()).forEach(([key, value]) => tmpProjects.push({ ...value, id: key }));
      }
      cb(tmpProjects)
    }
  );
}

export function deleteProject({ userId, projectId }) {
  const path = ref(database, `/workSpace-${userId}/projects/${projectId}`);
  remove(path);
}

export function getUser() {
  return auth.currentUser;
}