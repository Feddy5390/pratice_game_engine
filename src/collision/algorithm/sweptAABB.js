export default function checkSweptAABB(
  aEntityId,
  bEntityId,
  aLeftX,
  aRightX,
  aTopY,
  aBottomY,
  bLeftX,
  bRightX,
  bTopY,
  bBottomY,
  relativeVX,
  relativeVY,
) {
  const overlapX = Math.min(aRightX, bRightX) - Math.max(aLeftX, bLeftX);
  const overlapY = Math.min(aTopY, bTopY) - Math.max(aBottomY, bBottomY);
  if (overlapX > 0 && overlapY > 0) {
    return null;
  }

  let tEnterX;
  let tExitX;

  let tEnterY;
  let tExitY;

  if (relativeVX > 0) {
    tEnterX = (bLeftX - aRightX) / relativeVX;
    tExitX = (bRightX - aLeftX) / relativeVX;
  } else if (relativeVX < 0) {
    tEnterX = (bRightX - aLeftX) / relativeVX;
    tExitX = (bLeftX - aRightX) / relativeVX;
  } else {
    if (aRightX <= bLeftX || aLeftX >= bRightX) {
      return null;
    }

    tEnterX = -Infinity;
    tExitX = Infinity;
  }

  if (relativeVY > 0) {
    tEnterY = (bBottomY - aTopY) / relativeVY;
    tExitY = (bTopY - aBottomY) / relativeVY;
  } else if (relativeVY < 0) {
    tEnterY = (bTopY - aBottomY) / relativeVY;
    tExitY = (bBottomY - aTopY) / relativeVY;
  } else {
    if (aTopY <= bBottomY || aBottomY >= bTopY) {
      return null;
    }

    tEnterY = -Infinity;
    tExitY = Infinity;
  }

  const tFirst = Math.max(tEnterX, tEnterY);
  const tLast = Math.min(tExitX, tExitY);

  if (
    tFirst > tLast || // X 和 Y 的時間區間沒有交集（擦身而過）
    tFirst < 0 || // 碰撞發生在過去（這一格之前）
    tFirst > 1 // 碰撞發生在未來（這一格結束後才撞到）
  ) {
    return null; // 沒有發生碰撞
  }

  let normalX = 0;
  let normalY = 0;

  if (tEnterX > tEnterY) {
    // 說明 X 軸比較晚進入，表示是在 X 軸方向發生碰撞（撞到左右兩側）
    normalX = relativeVX > 0 ? -1 : 1; // 往右撞（moveX > 0），法線朝左（-1）；反之亦然
  } else {
    // 說明 Y 軸比較晚進入，表示是在 Y 軸方向發生碰撞（撞到上下兩側）
    normalY = relativeVY > 0 ? -1 : 1;
  }

  console.log('碰撞')

  return {
    entityA: aEntityId,
    entityB: bEntityId,

    normalX,
    normalY,

    time: tFirst,
  };
}
