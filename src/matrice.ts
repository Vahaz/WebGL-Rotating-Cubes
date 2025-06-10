//
// MATRICE
//

// Create a matrice
export function createMatrice(): Float32Array {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

/**
 * 
 *  x,  0,  0, 0
 *  0,  y,  0, 0
 *  0,  0,  z, 0
 * tx, ty, tz, 1
 */
export function translateMatrice(tx: number, ty: number, tz: number): Float32Array {
  const matrice = createMatrice();
  matrice[12] = tx;
  matrice[13] = ty;
  matrice[14] = tz;
  return matrice;
}

/**
 * To rorate on the Y axis:
 *  cos, 0, sin, 0
 *    0, 0,   0, 0
 * -sin, 0, cos, 0
 *    0, 0,   0, 0
 * To rorate on the X axis:
 * 0, 0, 0, 0
 * 0, cos, -sin, 0
 * 0, sin, cos, 0
 * 0, 0, 0, 0
 */
export function rotateMatrice(axis: string, angle: number): Float32Array {
    const matrice = createMatrice();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    if (axis == "X") {
        matrice[5] = cos;
        matrice[6] = -sin;
        matrice[9] = sin;
        matrice[10] = cos;
    } else if (axis == "Y") {
        matrice[0] = cos;
        matrice[2] = sin;
        matrice[8] = -sin;
        matrice[10] = cos;
    }
    return matrice;
}