import config from '~config';

export default function(numHoles) {
  const angryColumns = [];

  for (let i = 0; i < config.ANGRY_BLOCK_COLUMNS; i++) {
    angryColumns.push(i);
  }

  let holes = [];

  for (let j = angryColumns.length - 1; (j >= 0 && numHoles > holes.length); j--) {
    const splicePosition = Math.floor(Math.random() * angryColumns.length);
    holes.push(angryColumns[splicePosition]);
    angryColumns.splice(splicePosition, 1);
  }
  
  return holes;
}