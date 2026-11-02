import type { Project } from "@/lib/api";

/**
 * cover_image_url is now resolved server-side (backend joins Media.url via
 * the cover_image relationship). Falls back to the generated gradient
 * treatment when a project has no cover image set, or when the stored URL
 * isn't externally reachable yet (no /uploads static mount exists on the
 * backend as of this writing — see the backend brief).
 */
export default function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-200 ease-out hover:border-[var(--color-accent)]">
      <div
        className={[
          "relative overflow-hidden bg-[var(--color-surface-hover)]",
          featured ? "aspect-[4/3] sm:aspect-[21/9]" : "aspect-video",
        ].join(" ")}
      >
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 25% 20%, var(--color-accent-dim) 0%, transparent 55%), linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-surface) 100%)",
            }}
            aria-hidden="true"
          />
        )}
        {!project.cover_image_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={[
                "select-none font-mono font-semibold text-[var(--color-accent)] opacity-20 transition-opacity duration-300 group-hover:opacity-30",
                featured ? "text-6xl sm:text-7xl" : "text-3xl",
              ].join(" ")}
              aria-hidden="true"
            >
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {project.live_url && <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 font-mono text-[10px] text-[var(--color-status-live)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-status-live)]" aria-hidden="true" />
          Live
        </div>}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3
            className={[
              "font-medium leading-snug transition-colors group-hover:text-[var(--color-accent)]",
              featured ? "text-xl sm:text-2xl" : "text-lg",
            ].join(" ")}
          >
            {project.title}
          </h3>
          {project.summary && (
            <p
              className={[
                "mt-2 text-[var(--color-text-muted)] leading-relaxed",
                featured ? "text-sm sm:text-base" : "text-sm",
              ].join(" ")}
            >
              {project.summary}
            </p>
          )}
        </div>

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="rounded-sm border border-[var(--color-border)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-text-muted)]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-4 font-mono text-xs">
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              source &rarr;
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              live &rarr;
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

