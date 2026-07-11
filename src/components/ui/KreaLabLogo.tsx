import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

/**
 * Marca del logo de Krea Lab (el símbolo "K·"), portado desde
 * krea-lab-fondo-claro.svg. Solo el logo, sin el texto "REA LAB".
 */
export function KreaLabLogo({ height = 16 }: { height?: number }) {
  const ratio = 302 / 228; // viewBox recortado al símbolo (con pequeño margen)
  return (
    <Svg width={height * ratio} height={height} viewBox="110 110 302 228">
      <Defs>
        <LinearGradient id="kreaMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#29ABE2" />
          <Stop offset="55%" stopColor="#1B8FD6" />
          <Stop offset="100%" stopColor="#0F6FC0" />
        </LinearGradient>
      </Defs>
      <Path
        d="M261.2028 332.0 191.286615 231.403295H162.08112L249.107595 116.64634999999998H312.238665L234.357345 219.30809V198.362735L327.28392 332.0ZM117.83037 332.0V116.64634999999998H172.7013V332.0Z"
        fill="url(#kreaMark)"
      />
      <Path
        d="M 377.2 191.0 L 404.1 206.5 L 404.1 237.5 L 377.2 253.0 L 350.4 237.5 L 350.4 206.5 Z"
        fill="#19C9D6"
      />
    </Svg>
  );
}
