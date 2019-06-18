const GRID_SIZE = 86;

export default function getGridsPositions(startRowPos, numCols) {
  const matrix = [];

  for (let i = 0; i < numCols; i++) {
    matrix.push(i * GRID_SIZE, startRowPos * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  }

  return matrix;
}