import { getDownloadURL } from '@firebase/storage';
import { ref, uploadBytes } from "firebase/storage";
import { storage } from './firebase';
import { uuidv4 } from '@firebase/util';


export async function uploadFile(file) {
  return uploadBytes(ref(storage, uuidv4()), file).then(snapshot => getDownloadURL(snapshot.ref))
}