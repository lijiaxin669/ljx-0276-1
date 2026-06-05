function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resolveAABB(dynamicRect, staticRect) {
  const overlapX = Math.min(
    dynamicRect.x + dynamicRect.width - staticRect.x,
    staticRect.x + staticRect.width - dynamicRect.x
  );
  const overlapY = Math.min(
    dynamicRect.y + dynamicRect.height - staticRect.y,
    staticRect.y + staticRect.height - dynamicRect.y
  );

  if (overlapX < overlapY) {
    if (dynamicRect.x + dynamicRect.width / 2 < staticRect.x + staticRect.width / 2) {
      dynamicRect.x -= overlapX;
    } else {
      dynamicRect.x += overlapX;
    }
    return { axis: 'x', overlap: overlapX };
  } else {
    if (dynamicRect.y + dynamicRect.height / 2 < staticRect.y + staticRect.height / 2) {
      dynamicRect.y -= overlapY;
    } else {
      dynamicRect.y += overlapY;
    }
    return { axis: 'y', overlap: overlapY };
  }
}

function getRect(gameObject) {
  if (gameObject.body) {
    return {
      x: gameObject.body.x,
      y: gameObject.body.y,
      width: gameObject.body.width,
      height: gameObject.body.height,
    };
  }
  return {
    x: gameObject.x - (gameObject.displayWidth || gameObject.width || 0) / 2,
    y: gameObject.y - (gameObject.displayHeight || gameObject.height || 0) / 2,
    width: gameObject.displayWidth || gameObject.width || 0,
    height: gameObject.displayHeight || gameObject.height || 0,
  };
}

function isInZone(gameObject, zone) {
  const r = getRect(gameObject);
  return (
    r.x >= zone.x &&
    r.x + r.width <= zone.x + zone.width &&
    r.y >= zone.y &&
    r.y + r.height <= zone.y + zone.height
  );
}

export { aabbOverlap, resolveAABB, getRect, isInZone };
