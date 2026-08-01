import { NativeCarousel } from "../components/NativeCarousel";
import { asArray, EmptyState, str, type WidgetRenderProps } from "./shared";

export function TeamRender({ design, content, cls, ctx }: WidgetRenderProps) {
  const d = (design ?? {}) as Record<string, any>;
  const c = (content ?? {}) as Record<string, any>;

  const items = asArray<any>(c.items);

  if (!items.length) {
    return <EmptyState cls={cls} ctx={ctx} label="No team members added" />;
  }

  const layout = d.layout || "grid-2";
  const align = d.align || "center";
  const avatarShape = d.avatarShape || "circle";

  let gridTemplateColumns = "1fr";
  if (layout === "grid-2") gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
  else if (layout === "grid-3")
    gridTemplateColumns = "repeat(3, minmax(0, 1fr))";

  const renderedItems = items.map((item, i) => (
    <div
      key={i}
      className={cls("item")}
      style={{
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
      }}
    >
      {item.image ? (
        <img
          src={str(item.image) || undefined}
          alt={str(item.name) || "Team member"}
          className={cls("avatar")}
          style={{ borderRadius: avatarShape === "circle" ? "9999px" : "12px" }}
          loading="lazy"
        />
      ) : (
        <div
          className={cls("avatar")}
          style={{
            borderRadius: avatarShape === "circle" ? "9999px" : "12px",
            backgroundColor: "var(--tw-border-color, #e2e8f0)",
          }}
        />
      )}

      <div className={cls("content")}>
        {item.name && <div className={cls("name")}>{item.name}</div>}
        {item.role && <div className={cls("role")}>{item.role}</div>}
        {item.bio && <div className={cls("bio")}>{item.bio}</div>}
      </div>
    </div>
  ));

  return (
    <div className={cls("root")}>
      {c.heading && <h3 className={cls("heading")}>{c.heading}</h3>}

      {c.useCarousel ? (
        <NativeCarousel cls={cls} items={renderedItems} layout={layout} />
      ) : (
        <div className={cls("list")} style={{ gridTemplateColumns }}>
          {renderedItems}
        </div>
      )}
    </div>
  );
}
