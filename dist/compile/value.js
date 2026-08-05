"use strict";
/**
 * Value layer — turns authored style values into CSS text.
 *
 * The compiler is a GENERATOR, not a pass-through: every value that reaches
 * CSS is either produced by one of these serializers or dropped. There is no
 * code path that copies an arbitrary author string into a declaration, which
 * is why `expression()`, `url(javascript:…)` and `@import` can never appear.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALUE_RE = exports.IDENT_RE = void 0;
exports.isTokenRef = isTokenRef;
exports.parseTokenRef = parseTokenRef;
exports.tokenVar = tokenVar;
exports.cssValue = cssValue;
exports.len = len;
exports.color = color;
exports.box4 = box4;
exports.corners4 = corners4;
exports.border = border;
exports.background = background;
exports.safeUrl = safeUrl;
exports.shadow = shadow;
exports.transition = transition;
exports.transform = transform;
exports.clamp = clamp;
exports.utf8Bytes = utf8Bytes;
const definition_1 = require("../types/definition");
/** `{group.name}` where name is `[a-z0-9_-]` (case-insensitive). */
const TOKEN_RE = /^\{(color|space|radius|font|size|shadow)\.([A-Za-z0-9_-]+)\}$/;
/** Safe CSS identifier — token names and node ids are held to this. */
exports.IDENT_RE = /^[A-Za-z0-9_-]+$/;
exports.VALUE_RE = {
    /** Lengths, percentages and the keywords we allow in their place. */
    length: /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|fr)$|^0$|^auto$|^fit-content$|^min-content$|^max-content$/,
    color: /^#[0-9A-Fa-f]{3,8}$|^rgba?\(\s*[\d.]+\s*[, ]\s*[\d.]+\s*[, ]\s*[\d.]+\s*([,/]\s*[\d.]+%?\s*)?\)$|^hsla?\(\s*[\d.]+(deg)?\s*[, ]\s*[\d.]+%\s*[, ]\s*[\d.]+%\s*([,/]\s*[\d.]+%?\s*)?\)$|^transparent$|^currentColor$/,
    /** Unitless numbers, used for line-height / opacity / z-index. */
    number: /^-?\d+(\.\d+)?$/,
    /** Font stacks: quoted or bare families separated by commas. */
    fontFamily: /^[A-Za-z0-9 _'"-]+(\s*,\s*[A-Za-z0-9 _'"-]+)*$/,
    aspectRatio: /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$|^auto$/,
    /** Grid track lists — digits, fr/px/%, minmax, repeat, auto keywords. */
    gridTemplate: /^[\d\s./%a-z(),-]+$/i,
    /** Free-form but heavily restricted: alignment keywords only. */
    keyword: /^[a-z-]+( [a-z-]+)*$/,
    /** Percentages and keywords for background/object position. */
    position: /^[\d\s.%a-z-]+$/i,
    /** Cubic-bezier / steps / named easings. */
    easing: /^(linear|ease|ease-in|ease-out|ease-in-out)$|^cubic-bezier\(\s*[\d.\s,-]+\)$|^steps\(\s*\d+\s*(,\s*[a-z-]+\s*)?\)$/,
    /** blend modes, cursor, etc. */
    simpleKeyword: /^[a-z][a-z-]*$/,
};
function isTokenRef(v) {
    return typeof v === 'string' && TOKEN_RE.test(v);
}
function parseTokenRef(v) {
    const m = TOKEN_RE.exec(v);
    return m ? { group: m[1], name: m[2] } : null;
}
/** `{color.primary}` → `var(--c-primary)`. */
function tokenVar(group, name) {
    return `var(${definition_1.TOKEN_PREFIX[group]}${name})`;
}
/**
 * Resolve one scalar value to CSS text, or `null` if it fails validation.
 * A token ref always wins — its literal value is validated once, at the token
 * table, not at every use site.
 */
function cssValue(v, kind) {
    if (v === undefined || v === null || v === '')
        return null;
    if (typeof v === 'number') {
        if (!Number.isFinite(v))
            return null;
        // Bare numbers are lengths in px, except where unitless is meaningful.
        if (kind === 'number')
            return String(v);
        if (kind === 'length')
            return v === 0 ? '0' : `${v}px`;
        return String(v);
    }
    const s = v.trim();
    if (s.length > 200)
        return null;
    const ref = parseTokenRef(s);
    if (ref)
        return tokenVar(ref.group, ref.name);
    return exports.VALUE_RE[kind].test(s) ? s : null;
}
/** A length that may also be a raw number (interpreted as px). */
function len(v) {
    return cssValue(v, 'length');
}
function color(v) {
    return cssValue(v, 'color');
}
// ─── Composite serializers ───────────────────────────────────────────────────
/**
 * Box4 → `padding` / `margin`. Emits the 4-value shorthand so a later
 * breakpoint that changes one side still produces a complete, predictable box.
 */
function box4(b) {
    if (b === undefined || b === null || b === "")
        return null;
    const obj = typeof b !== 'object' ? { all: b } : b;
    if (Object.keys(obj).length === 0)
        return null;
    const all = obj.all !== undefined ? len(obj.all) : null;
    const side = (v) => (v !== undefined ? (len(v) ?? all ?? '0') : (all ?? '0'));
    const t = side(obj.t);
    const r = side(obj.r);
    const bo = side(obj.b);
    const l = side(obj.l);
    if (t === r && r === bo && bo === l)
        return t;
    if (t === bo && r === l)
        return `${t} ${r}`;
    return `${t} ${r} ${bo} ${l}`;
}
/** Corners4 → `border-radius`. */
function corners4(c) {
    if (c === undefined || c === null || c === "")
        return null;
    const obj = typeof c !== 'object' ? { all: c } : c;
    if (Object.keys(obj).length === 0)
        return null;
    const all = obj.all !== undefined ? len(obj.all) : null;
    const corner = (v) => v !== undefined ? (len(v) ?? all ?? '0') : (all ?? '0');
    const tl = corner(obj.tl);
    const tr = corner(obj.tr);
    const br = corner(obj.br);
    const bl = corner(obj.bl);
    if (tl === tr && tr === br && br === bl)
        return tl;
    return `${tl} ${tr} ${br} ${bl}`;
}
const BORDER_STYLES = new Set(['solid', 'dashed', 'dotted', 'none']);
/** BorderValue → one or more declarations. */
function border(b) {
    if (!b || typeof b !== 'object')
        return [];
    const out = [];
    const w = b.width !== undefined ? len(b.width) : null;
    const st = b.style && BORDER_STYLES.has(b.style) ? b.style : w ? 'solid' : null;
    const c = b.color !== undefined ? color(b.color) : null;
    if (b.sides && typeof b.sides === 'object') {
        for (const [k, side] of Object.entries(b.sides)) {
            const name = { t: 'top', r: 'right', b: 'bottom', l: 'left' }[k];
            if (!name || !side)
                continue;
            const sw = side.width !== undefined ? len(side.width) : w;
            const ss = side.style && BORDER_STYLES.has(side.style) ? side.style : st;
            const sc = side.color !== undefined ? color(side.color) : c;
            if (sw && ss)
                out.push([`border-${name}`, `${sw} ${ss} ${sc ?? 'currentColor'}`]);
        }
        return out;
    }
    if (w && st)
        out.push(['border', `${w} ${st} ${c ?? 'currentColor'}`]);
    else if (st)
        out.push(['border-style', st]);
    else if (c)
        out.push(['border-color', c]);
    return out;
}
const BG_SIZES = new Set(['cover', 'contain', 'auto']);
const BG_REPEATS = new Set(['no-repeat', 'repeat', 'repeat-x', 'repeat-y']);
/** BackgroundValue → declarations. Image URLs must already be allowlisted. */
function background(bg) {
    if (!bg || typeof bg !== 'object')
        return [];
    if (bg.kind === 'color') {
        const c = color(bg.color);
        return c ? [['background-color', c]] : [];
    }
    if (bg.kind === 'gradient') {
        const stops = (bg.stops ?? [])
            .map((s) => {
            const c = color(s.color);
            if (!c)
                return null;
            const at = s.at !== undefined ? cssValue(s.at, 'length') : null;
            return at ? `${c} ${at}` : c;
        })
            .filter((x) => x !== null);
        if (stops.length < 2)
            return [];
        const angle = Number.isFinite(bg.angle) ? Math.round(bg.angle) : 180;
        return [['background-image', `linear-gradient(${angle}deg, ${stops.join(', ')})`]];
    }
    if (bg.kind === 'image') {
        const url = safeUrl(bg.url);
        if (!url)
            return [];
        const out = [['background-image', `url("${url}")`]];
        if (bg.color) {
            const c = color(bg.color);
            if (c)
                out.unshift(['background-color', c]);
        }
        if (bg.size && BG_SIZES.has(bg.size))
            out.push(['background-size', bg.size]);
        if (bg.repeat && BG_REPEATS.has(bg.repeat))
            out.push(['background-repeat', bg.repeat]);
        else
            out.push(['background-repeat', 'no-repeat']);
        if (bg.position && exports.VALUE_RE.position.test(bg.position))
            out.push(['background-position', bg.position]);
        return out;
    }
    return [];
}
/** Only https/protocol-relative, and no quote or paren injection. */
function safeUrl(u) {
    if (typeof u !== 'string')
        return null;
    const s = u.trim();
    if (s.length > 2000)
        return null;
    if (/["\'()\\]|[\u0000-\u001f]/.test(s))
        return null;
    if (!/^https:\/\/[^\s]+$/i.test(s))
        return null;
    return s;
}
/** ShadowValue(s) → one `box-shadow` value. A token ref passes straight through. */
function shadow(sh) {
    if (sh === undefined)
        return null;
    if (typeof sh === 'string') {
        const ref = parseTokenRef(sh);
        return ref ? tokenVar(ref.group, ref.name) : null;
    }
    const list = Array.isArray(sh) ? sh : [sh];
    const parts = list
        .map((s) => {
        if (!s || typeof s !== 'object')
            return null;
        const x = len(s.x) ?? '0';
        const y = len(s.y) ?? '0';
        const blur = len(s.blur) ?? '0';
        const spread = s.spread !== undefined ? len(s.spread) : null;
        const c = color(s.color);
        if (!c)
            return null;
        return `${s.inset ? 'inset ' : ''}${x} ${y} ${blur}${spread ? ` ${spread}` : ''} ${c}`;
    })
        .filter((x) => x !== null);
    return parts.length ? parts.join(', ') : null;
}
const TRANSITIONABLE = new Set([
    'opacity',
    'transform',
    'background-color',
    'color',
    'border-color',
    'box-shadow',
    'filter',
    'all',
]);
function transition(t) {
    if (!t || typeof t !== 'object')
        return null;
    const props = (Array.isArray(t.property) ? t.property : [])
        .map((p) => String(p).trim())
        .filter((p) => TRANSITIONABLE.has(p));
    if (!props.length)
        return null;
    const dur = Number.isFinite(t.duration) ? Math.max(0, Math.min(5000, t.duration)) : 150;
    const easing = t.easing && exports.VALUE_RE.easing.test(t.easing) ? t.easing : 'ease';
    const delay = Number.isFinite(t.delay) ? Math.max(0, Math.min(5000, t.delay)) : 0;
    const suffix = `${dur}ms ${easing}${delay ? ` ${delay}ms` : ''}`;
    return props.map((p) => `${p} ${suffix}`).join(', ');
}
function transform(t) {
    if (!t || typeof t !== 'object')
        return null;
    const parts = [];
    const tx = t.translateX !== undefined ? len(t.translateX) : null;
    const ty = t.translateY !== undefined ? len(t.translateY) : null;
    if (tx || ty)
        parts.push(`translate(${tx ?? '0'}, ${ty ?? '0'})`);
    if (Number.isFinite(t.scale))
        parts.push(`scale(${clamp(t.scale, 0, 10)})`);
    if (Number.isFinite(t.rotate))
        parts.push(`rotate(${clamp(t.rotate, -360, 360)}deg)`);
    return parts.length ? parts.join(' ') : null;
}
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
/**
 * UTF-8 byte length without `Buffer`. The compiler runs in the builder's
 * browser too (for live preview), so nothing in this layer may touch a Node
 * global — that's what keeps `compile/` portable when it moves to the shared
 * package.
 */
const TEXT_ENCODER = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
function utf8Bytes(input) {
    if (TEXT_ENCODER)
        return TEXT_ENCODER.encode(input).length;
    // Fallback for exotic runtimes: count code units, good enough for a cap check.
    let bytes = 0;
    for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);
        if (code < 0x80)
            bytes += 1;
        else if (code < 0x800)
            bytes += 2;
        else if (code >= 0xd800 && code <= 0xdbff) {
            bytes += 4;
            i++;
        }
        else
            bytes += 3;
    }
    return bytes;
}
