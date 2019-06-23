const getContiguousBands = (bands) => {
  const contiguousBands = [];

  const findContigiousEnds = (bandIndex, start) => {
    const currentBand = bands[bandIndex];
    const nextBand = bands[bandIndex + 1];

    if (currentBand && nextBand && currentBand.end === nextBand.start) {
      return findContigiousEnds(bandIndex + 1, start);
    } else {
      contiguousBands.push({ start, end: currentBand.end });
    }

    if (nextBand) {
      findContigiousEnds(bandIndex + 1, nextBand.start);
    }
  }

  findContigiousEnds(0, bands[0].start);
  return contiguousBands;
}

export const getBlockAngryBlockSafeBands = (holePositions, widthPerBlock) => {
  holePositions.sort((a, b) => a > b ? 1 : -1);

  const rawPositions = holePositions.map(holePosition => ({
    start: holePosition * widthPerBlock,
    end: (holePosition * widthPerBlock) + widthPerBlock
  }));


  return getContiguousBands(rawPositions);
}

export const getOtherPlayerOccupiedBands = (otherPlayerPositions) => getContiguousBands(otherPlayerPositions);