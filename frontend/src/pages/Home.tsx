import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogPosts, getHomepagePhoto, getProjects, type BlogPostListItem, type HomepagePhoto, type Project } from "../../lib/api";
import ProjectCard from "../../components/ProjectCard";
import PageMeta from "../PageMeta";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [photo, setPhoto] = useState<HomepagePhoto | null>(null);
  const [photoUnavailable, setPhotoUnavailable] = useState(false);
  useEffect(() => {
    getProjects().then(setProjects).catch(() => setProjects([]));
    getBlogPosts().then(setPosts).catch(() => setPosts([]));
    getHomepagePhoto().then((image) => { setPhoto(image); setPhotoUnavailable(false); }).catch(() => setPhoto(null));
  }, []);
  const featured = projects.slice(0, 3);
  const latestPost = posts[0];

  return <>
    <PageMeta title="Kamal Kishor | Software Engineer" description="Software engineer focused on backend systems, practical AI, and reliable applications. Explore my work, experience, and technical interests." />
    <div className="mx-auto max-w-5xl px-6">
      <section className="grid items-center gap-12 border-b border-[var(--color-border)] pb-20 pt-16 md:grid-cols-[minmax(0,1fr)_280px] md:gap-10 md:pt-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div>
          <p className="mb-4 font-mono text-sm text-[var(--color-status-live)]">Software Engineer · Backend · AI/ML</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">I build useful software.<br/><span className="text-[var(--color-text-muted)]">From dependable APIs</span><br/><span className="text-[var(--color-accent)]">to intelligent applications.</span></h1>
          <p className="mt-6 max-w-xl leading-relaxed text-[var(--color-text-muted)]">I&apos;m Kamal Kishor, a software engineer with experience developing backend services and React interfaces for a multi-tenant learning platform. I enjoy solving practical problems across software, computer vision, machine learning, and connected devices—from a well-designed API to a resilient LoRa mesh network.</p>
          <div className="mt-8 flex flex-wrap gap-4 font-mono text-sm"><Link to="/projects" className="rounded-sm bg-[var(--color-accent)] px-4 py-2 font-medium text-[var(--color-bg)] transition-colors hover:opacity-90">Explore my work</Link><Link to="/contact" className="rounded-sm border border-[var(--color-border)] px-4 py-2 transition-colors hover:border-[var(--color-accent)]">Contact me</Link></div>
        </div>
        <div className="mx-auto w-full max-w-[280px] md:max-w-none">
          <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl shadow-black/10 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_35%,var(--color-accent-dim),transparent_65%),linear-gradient(145deg,var(--color-surface-hover),var(--color-surface))]">
              {photo && !photoUnavailable ? <img src={photo.url} alt={photo.alt_text} onError={() => setPhotoUnavailable(true)} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-mono text-6xl font-semibold tracking-tight text-[var(--color-accent)]/60" aria-label="Portrait placeholder">KK</div>}
            </div>
            {photo && !photoUnavailable && <span className="absolute bottom-5 left-5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/90 px-3 py-1 font-mono text-[10px] text-[var(--color-text-muted)]">Kamal Kishor</span>}
          </div>
        </div>
      </section>
      <section className="border-b border-[var(--color-border)] py-20">
        <div className="mb-8 flex items-baseline justify-between"><h2 className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">Selected work</h2><Link to="/projects" className="font-mono text-sm text-[var(--color-accent)] hover:underline">View all &rarr;</Link></div>
        {featured.length > 0 ? <div className="space-y-6"><ProjectCard project={featured[0]} featured/>{featured.length > 1 && <div className="grid gap-6 sm:grid-cols-2">{featured.slice(1).map(project => <ProjectCard key={project.id} project={project}/>)}</div>}</div> : <p className="font-mono text-sm text-[var(--color-text-muted)]">no published projects yet — check back soon.</p>}
      </section>
      {latestPost && <section className="py-20"><h2 className="mb-8 font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">Notes &amp; engineering</h2><Link to={`/blog/${latestPost.slug}`} className="group block rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-accent)]"><p className="mb-2 font-mono text-xs text-[var(--color-amber)]">{new Date(latestPost.created_at).toISOString().slice(0, 10)}</p><h3 className="text-lg font-medium transition-colors group-hover:text-[var(--color-accent)]">{latestPost.title}</h3></Link></section>}
    </div>
  </>;
}
