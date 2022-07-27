import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../../../../lib/firebase';
import Pointer from "./Pointer";


export default function PointersContainer({slideId, currentUserId}) {
  const { userId, projectId } = useParams();

  const [pointers, setPointers] = useState(null);

  useEffect(() => {
    const pointersRef = ref(database, `workSpace-${userId}/projects/${projectId}/slides/${slideId}/pointers`)
    onValue(pointersRef, (snapshot) => {
      setPointers(snapshot.val());
    })
  }, [])

  return <>{pointers && Object.entries(pointers).map(([key, value]) => key !== currentUserId ? <Pointer data={value} key={key} selectedSlideId={slideId}/> : <></>) }</>;
}
