export function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
