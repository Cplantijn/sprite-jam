import config from '~config';

function* getHole(arr) {
  let i = arr.length;

  while (i--) {
    yield arr.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
  }
}

export default function(numHoles) {
  const angryColumns = [];
  const holes = [];

  for (var i = 0; i < config.ANGRY_BLOCK_COLUMNS; i++) {
    angryColumns.push(i);
  }

  const randomHole = getHole(angryColumns);

  for (var j = 0; j < numHoles; j++) {
    holes.push(randomHole.next().value);
  }

  return holes;
}