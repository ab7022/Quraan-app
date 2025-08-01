import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export const QuranLogo = ({ size = 60 }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <Circle
      cx="30"
      cy="30"
      r="29"
      stroke="#4F8A10"
      strokeWidth="2"
      fill="#FAF3E7"
    />
    <Path
      d="M15 15C15 15 29 10 45 15V45C29 40 15 45 15 45V15Z"
      fill="#4F8A10"
      fillOpacity="0.2"
    />
    <Path
      d="M20 20C20 20 29 17 40 20V40C29 37 20 40 20 40V20Z"
      fill="#4F8A10"
    />
    <Path d="M23 23C23 23 29 21 37 23V37C29 35 23 37 23 37V23Z" fill="#fff" />
  </Svg>
);
