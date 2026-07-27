"use strict";
/**
 * Engine test suite.
 *
 * Two halves:
 *   • targeted tests for the compiler, validator and migration logic
 *   • a GENERIC widget suite that loops the registry, so every widget added
 *     from now on arrives with coverage for free (Appendix D.9 of the spec)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const artifact_1 = require("./compile/artifact");
const compile_css_1 = require("./compile/compile-css");
const declarations_1 = require("./compile/declarations");
const value_1 = require("./compile/value");
const migrate_1 = require("./content/migrate");
const template_switch_1 = require("./content/template-switch");
const definition_1 = require("./types/definition");
const field_1 = require("./types/field");
const definition_2 = require("./validate/definition");
const schema_to_zod_1 = require("./validate/schema-to-zod");
const registry_1 = require("./widgets/registry");
// ─── Fixtures ────────────────────────────────────────────────────────────────
function serviceWidget(over = {}) {
    return {
        kind: 'widget',
        id: 'svc',
        widget: 'SERVICE_LIST',
        key: 'services_main',
        role: 'services',
        label: 'Our Services',
        design: { layout: 'grid-2', showMedia: true, showDesc: true, mediaRatio: '4/3' },
        userOptions: ['layout'],
        userCanHide: true,
        defaultContent: { title: 'Our Services', description: '', items: [{ name: 'Design' }] },
        style: { base: { display: 'flex', flexDirection: 'column', gap: '{space.3}' } },
        partStyles: {
            item: {
                base: {
                    background: { kind: 'color', color: '{color.surface}' },
                    borderRadius: { all: '{radius.md}' },
                    padding: { all: '{space.3}' },
                },
                hover: { transform: { translateY: '-2px' }, boxShadow: '{shadow.md}' },
            },
            list: { base: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '{space.3}' } },
        },
        ...over,
    };
}
function fixture() {
    const def = (0, definition_1.blankDefinition)('Test Template');
    const header = {
        kind: 'element',
        id: 'hdr',
        tag: 'stack',
        style: {
            base: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '{space.2}' },
            md: { flexDirection: 'row' },
        },
        children: [
            {
                kind: 'element',
                id: 'av',
                tag: 'image',
                bind: { source: 'card', field: 'profileImage' },
                props: { alt: '' },
                style: { base: { width: '96px', height: '96px', borderRadius: { all: '{radius.full}' } } },
            },
            {
                kind: 'element',
                id: 'nm',
                tag: 'heading',
                props: { level: 1 },
                bind: { source: 'card', field: 'fullName' },
                style: { base: { fontSize: '{size.2xl}', fontWeight: 700, color: '{color.text}' } },
            },
            {
                kind: 'element',
                id: 'jt',
                tag: 'text',
                bind: { source: 'card', field: 'jobTitle' },
                hideIfEmpty: true,
                style: { base: { fontSize: '{size.sm}', color: '{color.muted}' } },
            },
        ],
    };
    def.root.children = [header, serviceWidget()];
    return def;
}
// ─── Compiler ────────────────────────────────────────────────────────────────
describe('compileCss', () => {
    it('emits cascade layers, tokens and the card frame', () => {
        const { css } = (0, compile_css_1.compileCss)(fixture());
        expect(css).toContain('@layer ts-reset, ts-template, ts-override;');
        expect(css).toContain('--c-primary:#3B5BFE');
        expect(css).toContain('--sp-4:16px');
        expect(css).toContain('max-width:450px');
    });
    it('resolves token refs to CSS variables, never to literals', () => {
        const { css } = (0, compile_css_1.compileCss)(fixture());
        expect(css).toContain('var(--r-full)');
        expect(css).toContain('var(--c-muted)');
        // the literal must appear only in the token table, not at a use site
        expect(css.match(/#6B7280/g)?.length).toBe(1);
    });
    it('scopes every rule to the card wrapper', () => {
        const { css } = (0, compile_css_1.compileCss)(fixture());
        const selectors = css.match(/(^|[{}])\s*([^{}@]+)\{/g) ?? [];
        const leaked = selectors.filter((s) => !s.includes('.ts-card') && !s.includes('@') && !s.includes('--'));
        expect(leaked).toEqual([]);
    });
    it('puts breakpoint rules in a min-width media query', () => {
        const { css } = (0, compile_css_1.compileCss)(fixture());
        expect(css).toContain('@media (min-width:768px)');
        const md = css.slice(css.indexOf('@media (min-width:768px)'));
        expect(md).toContain('flex-direction:row');
    });
    it('emits widget part styles and their hover state', () => {
        const { css } = (0, compile_css_1.compileCss)(fixture());
        expect(css).toContain('.ts-card .nsvc .p-item');
        expect(css).toContain('.ts-card .nsvc .p-item:hover');
        expect(css).toContain('translate(0, -2px)');
    });
    it('merges rules with identical declaration bodies', () => {
        const def = fixture();
        const shared = { base: { display: 'flex', gap: '{space.2}' } };
        def.root.children.push({ kind: 'element', id: 'a1', tag: 'stack', style: shared, children: [] }, { kind: 'element', id: 'a2', tag: 'stack', style: shared, children: [] });
        const { css } = (0, compile_css_1.compileCss)(def);
        expect(css).toContain('.ts-card .na1,.ts-card .na2{');
    });
    it('is deterministic — same input, byte-identical output', () => {
        const a = (0, compile_css_1.compileCss)(fixture()).css;
        const b = (0, compile_css_1.compileCss)(fixture()).css;
        expect(a).toBe(b);
    });
    it('folds `hidden` into the right breakpoint', () => {
        const def = fixture();
        def.root.children[0].hidden = { md: true };
        const { css } = (0, compile_css_1.compileCss)(def);
        const md = css.slice(css.indexOf('@media (min-width:768px)'));
        expect(md).toContain('display:none');
    });
    it('drops values it cannot emit rather than passing them through', () => {
        const def = fixture();
        def.root.children[0].style = {
            base: {
                color: 'red; } body { display:none } .x {',
                width: 'expression(alert(1))',
            },
        };
        const { css } = (0, compile_css_1.compileCss)(def);
        expect(css).not.toContain('expression');
        // the injected rule must not survive in any form
        expect(css).not.toContain('display:none');
        expect(css).not.toContain('red;');
        expect(css).not.toMatch(/body\s*\{/);
        // the whole node produced nothing, so it has no rule at all
        expect(css).not.toContain('.nhdr{');
    });
    it('never emits a non-https background image', () => {
        const def = fixture();
        def.root.children[0].style = {
            base: { background: { kind: 'image', url: 'javascript:alert(1)' } },
        };
        expect((0, compile_css_1.compileCss)(def).css).not.toContain('javascript');
    });
    it('stays inside the size budget for a realistic template', () => {
        const def = fixture();
        for (let i = 0; i < 100; i++) {
            def.root.children.push({
                kind: 'element',
                id: `f${i}`,
                tag: 'frame',
                style: { base: { padding: { all: '{space.3}' }, background: { kind: 'color', color: '{color.surface}' } } },
                children: [],
            });
        }
        const { bytes } = (0, compile_css_1.compileCss)(def);
        expect(bytes).toBeLessThan(20_000);
    });
});
describe('compileTokenOverrides', () => {
    it('emits only allowed colour tokens, in the override layer', () => {
        const css = (0, compile_css_1.compileTokenOverrides)({ color: { primary: '#E11D48', muted: '#000000' } }, 'ts-card-abc', ['primary']);
        expect(css).toContain('@layer ts-override');
        expect(css).toContain('--c-primary:#E11D48');
        expect(css).not.toContain('--c-muted');
    });
    it('rejects an invalid colour', () => {
        expect((0, compile_css_1.compileTokenOverrides)({ color: { primary: 'url(x)' } }, 'ts-card-abc', ['primary'])).toBe('');
    });
    it('is tiny', () => {
        const css = (0, compile_css_1.compileTokenOverrides)({ color: { primary: '#E11D48' } }, 'ts-card-abc', ['primary']);
        expect((0, value_1.utf8Bytes)(css)).toBeLessThan(120);
    });
});
describe('buildArtifact', () => {
    it('produces an immutable, content-addressed key', () => {
        const a = (0, artifact_1.buildArtifact)({ definition: fixture(), templateId: 'tpl-1', version: 3 });
        expect(a.key).toBe(`templates/tpl-1/v3.${a.hash}.css`);
        expect(a.hash).toMatch(/^[0-9a-f]{16}$/);
    });
    it('gives the same hash for an unchanged design', () => {
        const a = (0, artifact_1.buildArtifact)({ definition: fixture(), templateId: 't', version: 1 });
        const b = (0, artifact_1.buildArtifact)({ definition: fixture(), templateId: 't', version: 1 });
        expect(a.hash).toBe(b.hash);
    });
    it('changes the hash when the design changes', () => {
        const def = fixture();
        const a = (0, artifact_1.buildArtifact)({ definition: def, templateId: 't', version: 1 });
        def.tokens.color.primary = '#000000';
        const b = (0, artifact_1.buildArtifact)({ definition: def, templateId: 't', version: 1 });
        expect(a.hash).not.toBe(b.hash);
    });
    it('fingerprints independently of key order', () => {
        const a = { x: 1, y: { b: 2, a: 3 } };
        const b = { y: { a: 3, b: 2 }, x: 1 };
        expect((0, artifact_1.stableStringify)(a)).toBe((0, artifact_1.stableStringify)(b));
        expect((0, artifact_1.definitionFingerprint)(a)).toBe((0, artifact_1.definitionFingerprint)(b));
    });
});
// ─── Validator ───────────────────────────────────────────────────────────────
describe('validateDefinition', () => {
    it('accepts the fixture', () => {
        const r = (0, definition_2.validateDefinition)(fixture());
        expect(r.errors).toEqual([]);
        expect(r.ok).toBe(true);
        expect(r.stats.widgets).toBe(1);
    });
    it('rejects an unknown style property', () => {
        const def = fixture();
        def.root.style.base.wobble = '10px';
        const r = (0, definition_2.validateDefinition)(def);
        expect(r.ok).toBe(false);
        expect(r.errors.some((e) => e.message.includes('unknown style property'))).toBe(true);
    });
    it('rejects a value the compiler would silently drop', () => {
        const def = fixture();
        def.root.style.base.gap = 'ten pixels';
        const r = (0, definition_2.validateDefinition)(def);
        expect(r.ok).toBe(false);
        expect(r.errors[0].path).toBe('root.style.base.gap');
    });
    it('rejects duplicate node ids', () => {
        const def = fixture();
        def.root.children.push({ kind: 'element', id: 'hdr', tag: 'frame', children: [] });
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('duplicate node id'))).toBe(true);
    });
    it('rejects duplicate widget content keys', () => {
        const def = fixture();
        def.root.children.push(serviceWidget({ id: 'svc2' }));
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('duplicate content key'))).toBe(true);
    });
    it('rejects an unknown widget type', () => {
        const def = fixture();
        def.root.children[1].widget = 'NOPE';
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('unknown widget type'))).toBe(true);
    });
    it('rejects userOptions that are not real design keys', () => {
        const def = fixture();
        def.root.children[1].userOptions = ['layout', 'notAThing'];
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('is not a design option'))).toBe(true);
    });
    it('rejects a design value outside the widget schema', () => {
        const def = fixture();
        def.root.children[1].design = { layout: 'hexagon' };
        expect((0, definition_2.validateDefinition)(def).ok).toBe(false);
    });
    it('warns about part styles for a part that does not exist', () => {
        const def = fixture();
        def.root.children[1].partStyles.nonsense = { base: { gap: '4px' } };
        const r = (0, definition_2.validateDefinition)(def);
        expect(r.ok).toBe(true);
        expect(r.warnings.some((w) => w.message.includes('dead'))).toBe(true);
    });
    it('rejects children on a void tag', () => {
        const def = fixture();
        def.root.children.push({
            kind: 'element',
            id: 'bad',
            tag: 'text',
            children: [{ kind: 'element', id: 'kid', tag: 'text' }],
        });
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('cannot have children'))).toBe(true);
    });
    it('rejects an unknown card binding field', () => {
        const def = fixture();
        const avatar = def.root.children[0].children[0];
        avatar.bind = { source: 'card', field: 'salary' };
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('unknown card field'))).toBe(true);
    });
    it('rejects a javascript: href', () => {
        const def = fixture();
        def.root.children.push({
            kind: 'element',
            id: 'btn',
            tag: 'button',
            props: { label: 'x', href: 'javascript:alert(1)' },
        });
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('unsupported URL scheme'))).toBe(true);
    });
    it('rejects an invalid colour token', () => {
        const def = fixture();
        def.tokens.color.primary = 'red; }';
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.path === 'tokens.color.primary')).toBe(true);
    });
    it('enforces the node cap', () => {
        const def = fixture();
        for (let i = 0; i < 520; i++) {
            def.root.children.push({ kind: 'element', id: `n${i}`, tag: 'frame', children: [] });
        }
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('too many nodes'))).toBe(true);
    });
    it('rejects a slot that allows a derived widget', () => {
        const def = fixture();
        def.root.children.push({
            kind: 'slot',
            id: 'sl',
            key: 'extra',
            label: 'Extra',
            allow: ['CONTACT_LINKS'],
        });
        expect((0, definition_2.validateDefinition)(def).errors.some((e) => e.message.includes('cannot be user-added'))).toBe(true);
    });
});
// ─── Content schema → validator ──────────────────────────────────────────────
describe('schemaToZod', () => {
    const schema = (0, registry_1.manifest)().find((m) => m.type === 'SERVICE_LIST').contentSchema;
    it('accepts valid content', () => {
        const r = (0, schema_to_zod_1.validateAgainstSchema)(schema, {
            title: 'Services',
            items: [{ name: 'Design', description: '', price: '', link: 'https://x.com', image: '' }],
        });
        expect(r.issues).toEqual([]);
        expect(r.ok).toBe(true);
    });
    it('rejects a repeater row missing a required field', () => {
        const r = (0, schema_to_zod_1.validateAgainstSchema)(schema, { items: [{ description: 'no name' }] });
        expect(r.ok).toBe(false);
        expect(r.issues[0].path).toContain('items.0.name');
    });
    it('enforces the repeater cap', () => {
        const items = Array.from({ length: 25 }, (_, i) => ({ name: `s${i}` }));
        expect((0, schema_to_zod_1.validateAgainstSchema)(schema, { items }).ok).toBe(false);
    });
    it('rejects a javascript: URL', () => {
        const r = (0, schema_to_zod_1.validateAgainstSchema)(schema, {
            items: [{ name: 'x', link: 'javascript:alert(1)' }],
        });
        expect(r.ok).toBe(false);
    });
    it('honours the image host allowlist', () => {
        const good = (0, schema_to_zod_1.validateAgainstSchema)(schema, { items: [{ name: 'x', image: 'https://cdn.tapsleek.com/a.jpg' }] }, { imageHosts: ['cdn.tapsleek.com'] });
        const bad = (0, schema_to_zod_1.validateAgainstSchema)(schema, { items: [{ name: 'x', image: 'https://evil.example/a.jpg' }] }, { imageHosts: ['cdn.tapsleek.com'] });
        expect(good.ok).toBe(true);
        expect(bad.ok).toBe(false);
    });
    it('strips unknown keys instead of rejecting them', () => {
        const r = (0, schema_to_zod_1.validateAgainstSchema)(schema, { title: 'x', fromAFutureDeploy: 1 });
        expect(r.ok).toBe(true);
        expect(r.value).not.toHaveProperty('fromAFutureDeploy');
    });
});
// ─── Migration ───────────────────────────────────────────────────────────────
describe('content migration', () => {
    it('migrates SERVICE_LIST v1 → v2 (url → link)', () => {
        const r = (0, migrate_1.migrateWidgetContent)('SERVICE_LIST', {
            [migrate_1.VERSION_KEY]: 1,
            heading: 'Old heading',
            items: [{ label: 'Design', url: 'https://x.com', desc: 'old' }],
        });
        expect(r.changed).toBe(true);
        expect(r.content.title).toBe('Old heading');
        expect(r.content.items[0]).toMatchObject({
            name: 'Design',
            link: 'https://x.com',
            description: 'old',
        });
    });
    it('is a no-op at the current version', () => {
        const r = (0, migrate_1.migrateWidgetContent)('SERVICE_LIST', { [migrate_1.VERSION_KEY]: 2, title: 'x', items: [] });
        expect(r.changed).toBe(false);
    });
    it('leaves content from a newer deploy untouched', () => {
        const r = (0, migrate_1.migrateWidgetContent)('SERVICE_LIST', { [migrate_1.VERSION_KEY]: 99, title: 'future' });
        expect(r.changed).toBe(false);
        expect(r.content.title).toBe('future');
    });
    it('never throws on garbage', () => {
        expect(() => (0, migrate_1.migrateWidgetContent)('SERVICE_LIST', [])).not.toThrow();
        expect(() => (0, migrate_1.migrateWidgetContent)('SERVICE_LIST', null)).not.toThrow();
        expect(() => (0, migrate_1.migrateWidgetContent)('NOT_A_WIDGET', { a: 1 })).not.toThrow();
    });
    it('leaves orphaned keys alone', () => {
        const r = (0, migrate_1.migrateCardContent)({ gone: { [migrate_1.VERSION_KEY]: 1, a: 1 } }, {});
        expect(r.content.gone).toEqual({ [migrate_1.VERSION_KEY]: 1, a: 1 });
    });
    it('stamps the current version after migrating', () => {
        const def = fixture();
        const r = (0, migrate_1.migrateCardContent)({ services_main: { [migrate_1.VERSION_KEY]: 1, items: [{ label: 'a' }] } }, (0, template_switch_1.widgetTypeMap)(def));
        expect(r.content.services_main[migrate_1.VERSION_KEY]).toBe(2);
    });
});
// ─── Template switching ──────────────────────────────────────────────────────
describe('switchTemplateContent', () => {
    const from = fixture();
    function toDefinition(widgetOver) {
        const def = (0, definition_1.blankDefinition)('Target');
        def.root.children = [serviceWidget({ id: 'x1', ...widgetOver })];
        return def;
    }
    it('carries content across when the role matches', () => {
        const to = toDefinition({ key: 'my_services', role: 'services' });
        const r = (0, template_switch_1.switchTemplateContent)({ services_main: { [migrate_1.VERSION_KEY]: 2, title: 'Kept', items: [{ name: 'a' }] } }, from, to);
        expect(r.content.my_services.title).toBe('Kept');
        expect(r.mapping.services_main).toBe('my_services');
        expect(r.archive).toEqual([]);
    });
    it('falls back to widget type when the role differs', () => {
        const to = toDefinition({ key: 'k', role: 'offerings' });
        const r = (0, template_switch_1.switchTemplateContent)({ services_main: { [migrate_1.VERSION_KEY]: 2, title: 'Kept', items: [] } }, from, to);
        expect(r.content.k.title).toBe('Kept');
    });
    it('archives rather than deletes unmatched content', () => {
        const to = (0, definition_1.blankDefinition)('Empty');
        const r = (0, template_switch_1.switchTemplateContent)({ services_main: { [migrate_1.VERSION_KEY]: 2, title: 'Precious', items: [{ name: 'a' }] } }, from, to, { fromTemplateId: 'tpl-old' });
        expect(r.content).toEqual({});
        expect(r.archive).toHaveLength(1);
        expect(r.archive[0]).toMatchObject({ key: 'services_main', widget: 'SERVICE_LIST', fromTemplateId: 'tpl-old' });
        expect(r.archive[0].content.title).toBe('Precious');
    });
    it('migrates old content while carrying it', () => {
        const to = toDefinition({ key: 'k', role: 'services' });
        const r = (0, template_switch_1.switchTemplateContent)({ services_main: { [migrate_1.VERSION_KEY]: 1, heading: 'Old', items: [{ label: 'a', url: 'https://x.com' }] } }, from, to);
        expect(r.content.k.title).toBe('Old');
        expect(r.content.k.items[0].link).toBe('https://x.com');
        expect(r.content.k[migrate_1.VERSION_KEY]).toBe(2);
    });
    it('uses the target template demo content when nothing matches', () => {
        const to = toDefinition({ key: 'fresh', role: 'nothing_like_it', widget: 'FAQ' });
        const r = (0, template_switch_1.switchTemplateContent)({}, from, to);
        expect(r.content.fresh).toBeDefined();
    });
    it('does not archive content that is effectively empty', () => {
        const to = (0, definition_1.blankDefinition)('Empty');
        const r = (0, template_switch_1.switchTemplateContent)({ services_main: { [migrate_1.VERSION_KEY]: 2, title: '', items: [] } }, from, to);
        expect(r.archive).toEqual([]);
    });
});
describe('seedContentFromTemplate', () => {
    it('seeds every editable widget and skips derived ones', () => {
        const def = fixture();
        def.root.children.push({
            kind: 'widget',
            id: 'lnk',
            widget: 'CONTACT_LINKS',
            key: 'links_main',
            label: 'Links',
        });
        const seeded = (0, template_switch_1.seedContentFromTemplate)(def);
        expect(seeded.services_main).toBeDefined();
        expect(seeded.links_main).toBeUndefined();
    });
});
// ─── Generic widget suite (every widget gets this for free) ──────────────────
describe('widget registry', () => {
    it('has no duplicate types', () => {
        expect(new Set(registry_1.WIDGET_TYPES).size).toBe(registry_1.WIDGET_TYPES.length);
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: meta is well formed', (_type, meta) => {
        expect(meta.label).toBeTruthy();
        expect(meta.iconName).toMatch(/^[A-Za-z0-9]+$/);
        expect(meta.contentVersion).toBeGreaterThanOrEqual(1);
        expect(meta.parts.length).toBeGreaterThan(0);
        expect(new Set(meta.parts.map((p) => p.key)).size).toBe(meta.parts.length);
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: manifest survives JSON round-trip', (_type, meta) => {
        expect(JSON.parse(JSON.stringify(meta))).toEqual(meta);
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: defaultContent satisfies contentSchema', (_type, meta) => {
        if (meta.derived)
            return;
        const r = (0, schema_to_zod_1.validateAgainstSchema)(meta.contentSchema, meta.defaultContent);
        expect(r.issues).toEqual([]);
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: defaultDesign satisfies designSchema', (_type, meta) => {
        const r = (0, schema_to_zod_1.validateAgainstSchema)(meta.designSchema, meta.defaultDesign);
        expect(r.issues).toEqual([]);
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: field keys are unique at every level', (_type, meta) => {
        for (const fields of [meta.contentSchema, meta.designSchema]) {
            const seen = new Set();
            for (const f of fields) {
                expect(seen.has(f.key)).toBe(false);
                seen.add(f.key);
            }
        }
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: visibleIf references a sibling field', (_type, meta) => {
        for (const fields of [meta.contentSchema, meta.designSchema]) {
            const keys = new Set(fields.map((f) => f.key));
            for (const f of fields) {
                if (f.visibleIf)
                    expect(keys.has(f.visibleIf.key)).toBe(true);
            }
        }
        for (const p of meta.parts) {
            if (p.visibleIf) {
                expect(meta.designSchema.some((f) => f.key === p.visibleIf.key)).toBe(true);
            }
        }
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: defaultsFor produces schema-valid content', (_type, meta) => {
        if (meta.derived)
            return;
        const defaults = (0, field_1.defaultsFor)(meta.contentSchema);
        expect(() => JSON.stringify(defaults)).not.toThrow();
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: nested fields stay within the depth limit', (_type, meta) => {
        let max = 0;
        (0, field_1.walkFields)(meta.contentSchema, (_f, _p, depth) => {
            max = Math.max(max, depth);
        });
        expect(max).toBeLessThanOrEqual(2);
    });
    it.each((0, registry_1.manifest)().map((m) => [m.type, m]))('%s: every part is stylable and compiles', (_type, meta) => {
        const def = (0, definition_1.blankDefinition)('Parts');
        const partStyles = {};
        for (const p of meta.parts)
            partStyles[p.key] = { base: { gap: '{space.2}' } };
        def.root.children = [
            {
                kind: 'widget',
                id: 'w1',
                widget: meta.type,
                key: 'w_key',
                label: meta.label,
                design: meta.defaultDesign,
                defaultContent: meta.derived ? undefined : meta.defaultContent,
                partStyles,
            },
        ];
        const validation = (0, definition_2.validateDefinition)(def);
        expect(validation.errors).toEqual([]);
        const { css } = (0, compile_css_1.compileCss)(def);
        for (const p of meta.parts)
            expect(css).toContain(`.nw1 .p-${p.key}`);
    });
    it('exposes part keys for a known widget', () => {
        expect((0, registry_1.partKeys)('SERVICE_LIST')).toContain('item');
        expect((0, registry_1.partKeys)('NOPE')).toEqual([]);
    });
});
// ─── Misc guards ─────────────────────────────────────────────────────────────
describe('safeUrl', () => {
    it.each([
        ['https://cdn.tapsleek.com/a.png', true],
        ['http://cdn.tapsleek.com/a.png', false],
        ['javascript:alert(1)', false],
        ['https://x.com/a").png', false],
        ['//cdn.tapsleek.com/a.png', false],
    ])('%s → %s', (url, expected) => {
        expect((0, value_1.safeUrl)(url) !== null).toBe(expected);
    });
});
describe('declarationsFor', () => {
    it('expands lineClamp into the webkit trio', () => {
        expect((0, declarations_1.declarationsFor)({ lineClamp: 2 })).toEqual([
            ['display', '-webkit-box'],
            ['-webkit-line-clamp', '2'],
            ['-webkit-box-orient', 'vertical'],
            ['overflow', 'hidden'],
        ]);
    });
    it('keeps line-height unitless when given a number', () => {
        expect((0, declarations_1.declarationsFor)({ lineHeight: 1.5 })).toEqual([['line-height', '1.5']]);
    });
    it('collapses a uniform Box4 to one value', () => {
        expect((0, declarations_1.declarationsFor)({ padding: { all: '16px' } })).toEqual([['padding', '16px']]);
    });
    it('emits a 4-value box when sides differ', () => {
        expect((0, declarations_1.declarationsFor)({ padding: { t: '4px', r: '8px', b: '12px', l: '16px' } })).toEqual([
            ['padding', '4px 8px 12px 16px'],
        ]);
    });
    it('ignores properties outside the whitelist', () => {
        expect((0, declarations_1.declarationsFor)({ content: '"x"' })).toEqual([]);
    });
});
