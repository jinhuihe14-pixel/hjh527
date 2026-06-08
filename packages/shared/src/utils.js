"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.clamp = clamp;
exports.lerp = lerp;
exports.lerpVector2 = lerpVector2;
exports.distance = distance;
exports.normalize = normalize;
exports.dot = dot;
exports.magnitude = magnitude;
exports.scale = scale;
exports.addVectors = addVectors;
exports.subtractVectors = subtractVectors;
exports.angle = angle;
exports.circleCollision = circleCollision;
exports.clampVectorToBounds = clampVectorToBounds;
exports.randomRange = randomRange;
exports.randomInt = randomInt;
exports.formatTime = formatTime;
exports.formatNumber = formatNumber;
exports.deepClone = deepClone;
exports.debounce = debounce;
exports.throttle = throttle;
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function lerpVector2(a, b, t) {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
    };
}
function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0)
        return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}
function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}
function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}
function scale(v, s) {
    return { x: v.x * s, y: v.y * s };
}
function addVectors(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
function subtractVectors(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
function angle(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}
function circleCollision(pos1, r1, pos2, r2) {
    const dist = distance(pos1, pos2);
    return dist < r1 + r2;
}
function clampVectorToBounds(v, width, height, padding = 0) {
    return {
        x: clamp(v.x, padding, width - padding),
        y: clamp(v.y, padding, height - padding),
    };
}
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function formatNumber(num) {
    if (num >= 1000000)
        return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000)
        return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
function throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
