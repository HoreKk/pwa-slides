import { Icon } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import { GiArrowCursor } from 'react-icons/gi';

export default function Pointer({data, selectedSlideId}) {
  const container = document.getElementById(`container-${selectedSlideId}`);

  const colors = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#9e9e9e", "#607d8b"];
  
  // eslint-disable-next-line no-undef
  const [arrowColor, setArrowColor] = useState(null);

  useEffect(() => {
    setArrowColor(colors[Math.floor(Math.random() * colors.length - 1)]);
  }, [])

  //if data.time is older than 3min ago, return fragment
  if (data.time < Date.now() - 1000 * 60 * 3) {
    return <></>;
  }

  const x = (data.x * container.offsetWidth) / data.containerWidth;
  console.log(x);
  const y = (data.y * container.offsetHeight) / data.containerHeight;
  console.log(y);
  
  return <div style={{position:"absolute", top: `${y}px`, left: `${x}px`, zIndex: 1000000}}><Icon color={arrowColor}  fontSize={16} as={GiArrowCursor}></Icon></div>
}