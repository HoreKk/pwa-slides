import { openDB } from 'idb';

const PROJECT_STORE_NAME = 'Projects';

export function initDB() {
  return openDB('OpenSlides', 1, {
    upgrade(db) {
      const projectStore = db.createObjectStore(PROJECT_STORE_NAME, {
        keyPath: 'id',
      });
      projectStore.createIndex('id', 'id');
    },
  });
}

const done = (tx) => tx.done.then(() => document.dispatchEvent(new Event('db-updated')));

export async function setIdbProjects(data = []) {
  const db = await initDB();
  const tx = db.transaction(PROJECT_STORE_NAME, 'readwrite');
  data.forEach((item) => {
    tx.store.put(item);
  });
  await done(tx);
  return db.getAllFromIndex(PROJECT_STORE_NAME, 'id');
}

export async function setIdbProject(data = {}) {
  const db = await initDB();
  const tx = db.transaction(PROJECT_STORE_NAME, 'readwrite');
  await done(tx);
  return db.getFromIndex(PROJECT_STORE_NAME, 'id', data.id);
}

export async function getIdbProjects() {
  const db = await initDB();
  return db.getAllFromIndex(PROJECT_STORE_NAME, 'id');
}

export async function getIdbProject(id) {
  const db = await initDB();
  return db.getFromIndex(PROJECT_STORE_NAME, 'id', id);
}

export async function unsetIdbProject(id) {
  const db = await initDB();
  await db.delete(PROJECT_STORE_NAME, id);
}
