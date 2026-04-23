import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileJsonIcon,
  DatabaseIcon,
  LinkIcon,
  PaletteIcon,
  SparklesIcon,
  SmartphoneIcon,
  LayersIcon,
  VideoIcon,
  TypeIcon,
  SlidersHorizontalIcon,
  DropletIcon,
  AlignLeftIcon,
  WandIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import TemplatePreview from "@/components/TemplatePreview";
import { useAppSelector } from "@/store";
import { templates } from "@/utils";
import { FAKE_PREVIEW } from "@/utils/constants/fakePreview.constants";
import youtubePreview from "@/assets/images/preview-youtube.png";
import configurationPreview from "@/assets/images/preview-configuration.png";
import downloadPreview from "@/assets/images/preview-dowload.png";

// ── Template Gif Carousel ────────────────────────────────────────────────────

function TemplateGifCarousel({
  onActiveChange,
}: {
  onActiveChange: (tpl: (typeof templates)[0]) => void;
}) {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [carouselH, setCarouselH] = useState(() =>
    window.innerWidth < 768 ? 280 : 400,
  );
  useEffect(() => {
    const handler = () => setCarouselH(window.innerWidth < 768 ? 280 : 400);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const carouselW = Math.round((carouselH * 9) / 16);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => setActive((i) => (i + 1) % templates.length),
      4000,
    );
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    onActiveChange(templates[active]);
  }, [active, onActiveChange]);

  const go = (dir: 1 | -1) => {
    setActive((i) => (i + dir + templates.length) % templates.length);
    startTimer();
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => go(-1)}
        className="size-7 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors shrink-0"
      >
        <ChevronLeftIcon className="size-3.5 text-muted-foreground" />
      </button>

      <div className="flex flex-col gap-3 items-center">
        <div
          className="rounded-2xl overflow-hidden border border-border shadow-lg"
          style={{ width: carouselW, height: carouselH }}
        >
          <TemplatePreview
            mode="fake"
            templateOverride={templates[active].label}
            fakeOverride={{
              bgSrc: FAKE_PREVIEW[templates[active].label]?.bgSrc,
            }}
          />
        </div>

        <div className="flex gap-1.5">
          {templates.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                startTimer();
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === active
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => go(1)}
        className="size-7 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors shrink-0"
      >
        <ChevronRightIcon className="size-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

// ── Scroll animations ────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: "01",
    title: "Choisis ton format",
    description:
      "Quatre templates disponibles, chacun pensé pour un style de contenu différent. Top, Classic, Minimal ou Expanded.",
    carousel: true,
  },
  {
    step: "02",
    title: "Configure tes données",
    description:
      "Remplis les champs. Importe un JSON ou pioche dans une base de données avec toutes les musiques Spotify à plus de 1 milliard d'écoutes. Tous les changements se prévisualisent en temps réel sur la droite.",
    image: configurationPreview,
  },
  {
    step: "03",
    title: "Ajoute tes sources vidéo",
    description:
      "Colle n'importe quel lien vidéo ou utilise la recherche intégrée pour trouver directement sur YouTube.",
    image: youtubePreview,
  },
  {
    step: "04",
    title: "Lance le rendu & télécharge",
    description:
      'Un clic sur "Lancer le rendu". Le serveur traite et assemble ta vidéo. Tu suis la progression en direct — si le résultat te plaît, tu télécharges directement depuis l\'app.',
    image: downloadPreview,
  },
];

// ── Step item (animated) ──────────────────────────────────────────────────────

function StepItem({
  s,
  i,
  activeTemplate,
  setActiveTemplate,
}: {
  s: (typeof STEPS)[number];
  i: number;
  activeTemplate: (typeof templates)[0];
  setActiveTemplate: (t: (typeof templates)[0]) => void;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`flex flex-col gap-8 md:flex-row md:items-center md:gap-16 transition-all duration-700 ease-out ${
        i % 2 === 1 ? "md:flex-row-reverse" : ""
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
    >
      <div className="flex-1 flex flex-col gap-4">
        <span className="text-5xl font-bold text-[#a1a1a1] opacity-40 leading-none select-none">
          {s.step}
        </span>
        <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
        <p className="text-muted-foreground leading-relaxed max-w-md">
          {s.description}
        </p>
        {i === 0 && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-border">
            <div className="flex items-center gap-1.5 mt-4">
              <span className="text-sm font-semibold capitalize">
                {activeTemplate.label}
              </span>
              {activeTemplate.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {activeTemplate.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center">
        {"carousel" in s && s.carousel ? (
          <TemplateGifCarousel onActiveChange={setActiveTemplate} />
        ) : "image" in s && s.image ? (
          <img
            src={s.image}
            alt={s.title}
            className="w-full rounded-2xl border border-border shadow-lg object-cover"
          />
        ) : (
          <div className="w-full aspect-video rounded-2xl border border-dashed border-border bg-muted/30 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Image à venir</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────

const FEATURE_GROUPS = [
  {
    category: "Données",
    items: [
      {
        icon: LinkIcon,
        label: "Tout lien vidéo",
        description:
          "YouTube, Twitch, ou n'importe quelle URL compatible. Pas de restriction de plateforme.",
      },
      {
        icon: FileJsonIcon,
        label: "Import JSON",
        description:
          "Colle un tableau de clips ou un objet complet avec titre global. Validation et aperçu instantané avant import.",
      },
      {
        icon: DatabaseIcon,
        label: "Billions Club",
        description:
          "Base de données intégrée de toutes les musiques dépassant 1 milliard de streams sur Spotify. Recherche par titre, artiste ou album.",
      },
      {
        icon: LayersIcon,
        label: "Multi-clips",
        description:
          "Autant de clips que tu veux. Chaque extrait a ses propres réglages de style, durée et point de départ.",
      },
    ],
  },
  {
    category: "Style & texte",
    items: [
      {
        icon: TypeIcon,
        label: "11 polices",
        description:
          "Bebas Neue, DejaVu Sans, Inter, Inter Medium, Inter SemiBold, Montserrat, Montserrat Light, Montserrat Medium, Helvetica, Helvetica Bold, Helvetica Black.",
      },
      {
        icon: PaletteIcon,
        label: "Couleurs & bordures",
        description:
          "Colorpicker ou saisie hexadécimale pour chaque texte. Épaisseur de bordure réglable indépendamment.",
      },
      {
        icon: WandIcon,
        label: "5 animations",
        description:
          "Aucune, fondu, machine à écrire, glissement gauche, glissement bas. Par titre ou sous-titre, avec aperçu live.",
      },
      {
        icon: AlignLeftIcon,
        label: "Position du texte",
        description:
          "Aligné à gauche ou centré. Applicable individuellement ou à tous les clips d'un coup.",
      },
    ],
  },
  {
    category: "Paramètres rendu",
    items: [
      {
        icon: VideoIcon,
        label: "Fond personnalisable",
        description:
          "Vidéo floutée, blanc, noir ou couleur custom via colorpicker. Visible en temps réel dans la prévisualisation.",
      },
      {
        icon: SlidersHorizontalIcon,
        label: "Marge & espacement",
        description:
          "Contrôle la marge horizontale de la vidéo et l'espacement entre le titre, sous-titre et la vidéo.",
      },
      {
        icon: SparklesIcon,
        label: "Transition douce",
        description:
          "Transition animée entre chaque clip. Durée configurable entre 0.1s et 2s.",
      },
      {
        icon: DropletIcon,
        label: "Filigrane",
        description:
          "Texte en bas à gauche de la vidéo. Police, taille, couleur et opacité configurables.",
      },
    ],
  },
  {
    category: "Prévisualisation",
    items: [
      {
        icon: BookmarkIcon,
        label: "Sauvegarde des paramètres",
        description:
          "Enregistre ton template, ton mode et tous tes réglages de style par défaut. Ils sont restaurés automatiquement à chaque nouvelle session.",
      },
      {
        icon: SmartphoneIcon,
        label: "Mockup iPhone live",
        description:
          "Chaque modification est reflétée instantanément dans un vrai rendu CSS du contenu final en 1080×1920.",
      },
      {
        icon: SparklesIcon,
        label: "Aperçu highlight actif",
        description:
          "Simule l'animation de mise en avant clip par clip dans la preview, du dernier vers le premier.",
      },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────

const TITLE = "Vexia";
const heroAnim = (delay: number): React.CSSProperties => ({
  animation: `hero-fade-up 0.7s ease-out ${delay}ms both`,
});

export default function Home() {
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);

  // Typewriter loop
  const [displayed, setDisplayed] = useState(0);
  const [erasing, setErasing] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (!erasing) {
      if (displayed < TITLE.length) {
        t = setTimeout(() => setDisplayed((d) => d + 1), 75);
      } else {
        t = setTimeout(() => setErasing(true), 8000);
      }
    } else {
      if (displayed > 0) {
        t = setTimeout(() => setDisplayed((d) => d - 1), 40);
      } else {
        t = setTimeout(() => setErasing(false), 500);
      }
    }
    return () => clearTimeout(t);
  }, [erasing, displayed]);
  const typing = !erasing && displayed < TITLE.length;

  // Parallax orbs
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (orb1Ref.current)
        orb1Ref.current.style.transform = `translateY(${y * 0.25}px)`;
      if (orb2Ref.current)
        orb2Ref.current.style.transform = `translateY(${y * 0.15}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 md:py-36 gap-7 overflow-hidden">
        {/* Orbs — position fixe + léger pulse */}
        <div
          ref={orb1Ref}
          className="pointer-events-none absolute -top-40 -left-20 w-150 h-150 rounded-full bg-violet-600 blur-[130px] will-change-transform"
          style={{ animation: "orb-pulse-1 7s ease-in-out infinite" }}
        />
        <div
          ref={orb2Ref}
          className="pointer-events-none absolute -top-20 -right-20 w-125 h-125 rounded-full bg-blue-500 blur-[110px] will-change-transform"
          style={{ animation: "orb-pulse-2 10s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 rounded-full bg-indigo-500 blur-[150px]"
          style={{ animation: "orb-pulse-3 13s ease-in-out infinite" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_30%,hsl(var(--background)/0.85)_100%)]" />

        <span
          style={heroAnim(0)}
          className="relative z-10 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium tracking-widest text-muted-foreground uppercase"
        >
          <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
          Vidéos short-form automatisées
        </span>

        <h1 className="relative z-10 text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
          {TITLE.slice(0, displayed)}
          <span
            className="inline-block w-0.75 h-[0.8em] bg-foreground ml-1 align-middle rounded-sm"
            style={{
              animation: typing
                ? undefined
                : "cursor-blink 1s step-end infinite",
              opacity: typing ? 1 : undefined,
            }}
          />
        </h1>
        <p
          style={heroAnim(900)}
          className="relative z-10 text-lg text-muted-foreground max-w-sm leading-relaxed"
        >
          Génère des Reels, Shorts et Stories percutants à partir de n'importe
          quelle vidéo, en quelques clics.
        </p>

        <div
          style={heroAnim(1100)}
          className="relative z-10 hidden lg:flex items-center gap-3 mt-1"
        >
          <Button
            size="lg"
            onClick={() => navigate(token ? "/create-video" : "/logging")}
          >
            Créer une vidéo
            <ArrowRightIcon className="size-4" />
          </Button>
          {token && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/last-job")}
            >
              Dernier rendu
            </Button>
          )}
        </div>

        <div
          style={heroAnim(1300)}
          className="relative z-10 grid grid-cols-2 gap-x-8 gap-y-3 mt-2 sm:flex sm:items-center sm:gap-6"
        >
          {[
            { value: "4", label: "templates" },
            { value: "5", label: "minutes" },
            { value: "100%", label: "personnalisable" },
            { value: "∞", label: "clips" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-2xl font-bold tracking-tight">{value}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="px-6 py-10 lg:px-12 lg:py-16 flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Comment ça marche
          </h2>
          <p className="text-muted-foreground text-sm">
            Quatre étapes, quelques minutes.
          </p>
        </div>

        {STEPS.map((s, i) => (
          <StepItem
            key={s.step}
            s={s}
            i={i}
            activeTemplate={activeTemplate}
            setActiveTemplate={setActiveTemplate}
          />
        ))}
      </section>

      <Separator />

      <section className="px-6 py-10 lg:px-12 lg:py-16 flex flex-col gap-10 lg:gap-14">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Tout ce que tu peux configurer
          </h2>
          <p className="text-muted-foreground text-sm">
            Contrôle total sur les données, le style et le rendu.
          </p>
        </div>

        {FEATURE_GROUPS.map((group) => (
          <div
            key={group.category}
            className="flex flex-col gap-5"
          >
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {group.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <FadeIn
                    key={item.label}
                    delay={idx * 80}
                  >
                    <div className="flex flex-col gap-3 rounded-xl border border-border p-5 h-full">
                      <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-foreground" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <Separator />
      <section className="flex flex-col items-center justify-center text-center px-6 py-14 lg:py-20 gap-5">
        <FadeIn className="flex flex-col items-center gap-5">
          <h2 className="text-3xl font-bold tracking-tight">Prêt à créer ?</h2>
          <p className="text-muted-foreground max-w-sm">
            Quelques minutes suffisent pour générer une vidéo court-format
            professionnelle.
          </p>
          <div className="hidden lg:block">
            <Button
              size="lg"
              onClick={() => navigate(token ? "/create-video" : "/logging")}
            >
              {token ? "Créer une vidéo" : "Se connecter"}
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
          <div className="border border-border rounded-full px-4 py-2 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            <p className="lg:hidden text-xs text-muted-foreground">
              Disponible uniquement sur ordinateur
            </p>
          </div>
        </FadeIn>
      </section>

      <Separator />
      <section className="px-6 py-10 lg:px-12 lg:py-14 flex flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Stack technique
          </h2>
          <p className="text-muted-foreground text-sm">
            Deux services, un pipeline.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              role: "Frontend",
              name: "Héphaïstos",
              repo: "https://github.com/anthony-rgs/hephaistos",
              groups: [
                { label: "UI", items: ["React", "TypeScript", "Vite"] },
                { label: "État", items: ["Redux Toolkit", "React Router"] },
                { label: "Style", items: ["Tailwind CSS", "shadcn/ui"] },
                { label: "Réseau", items: ["Axios", "SSE"] },
                { label: "Déploiement", items: ["Netlify"] },
                { label: "IA", items: ["Claude — Anthropic"] },
              ],
            },
            {
              role: "Backend",
              name: "Orphée",
              repo: "https://github.com/anthony-rgs/olympe/tree/main/orphee",
              groups: [
                { label: "Runtime", items: ["Python", "FastAPI", "Uvicorn"] },
                { label: "Vidéo", items: ["FFmpeg", "yt-dlp", "Pillow"] },
                { label: "Auth", items: ["JWT", "bcrypt"] },
                { label: "Infra", items: ["Docker", "Caddy", "OVH"] },
                { label: "IA", items: ["Claude — Anthropic"] },
              ],
            },
          ].map((s, idx) => (
            <FadeIn
              key={s.name}
              delay={idx * 120}
            >
              <div className="relative rounded-2xl border border-border bg-muted/20 overflow-hidden px-5 py-6 lg:px-10 lg:py-8">
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
                  <div className="flex flex-col gap-3 lg:w-70 lg:shrink-0">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                      {s.role}
                    </span>
                    <h3 className="text-4xl lg:text-5xl font-black tracking-tight leading-none">
                      {s.name}
                    </h3>
                    <a
                      href={s.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 self-start inline-flex items-center gap-1 text-xs font-semibold border border-border rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
                    >
                      Voir le repo <ArrowUpRightIcon className="size-3" />
                    </a>
                  </div>

                  <div className="hidden lg:block w-px self-stretch bg-border shrink-0" />

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 lg:gap-x-8">
                    {s.groups.map(({ label, items }) => (
                      <div
                        key={label}
                        className="flex flex-col gap-1.5"
                      >
                        <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
                          {label}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {items.map((t) => (
                            <span
                              key={t}
                              className="text-xs font-semibold bg-muted rounded-md px-2 py-1"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <Separator />
      <footer
        className="px-6 py-6 lg:px-12 lg:py-8 text-xs text-muted-foreground
        flex flex-col items-center text-center gap-1.5
        min-[600px]:grid min-[600px]:grid-cols-2 min-[600px]:items-center min-[600px]:text-left min-[600px]:gap-4
        min-[850px]:flex min-[850px]:flex-row min-[850px]:items-center min-[850px]:justify-between"
      >
        <div className="flex items-center justify-center gap-2 min-[600px]:justify-start">
          <span className="font-semibold text-foreground">vexia.studio</span>
          <span>—</span>
          <span>Générateur de vidéos short-form</span>
        </div>
        <div className="flex flex-col gap-1.5 items-center min-[600px]:items-end min-[850px]:flex-row min-[850px]:items-center min-[850px]:gap-1">
          <span>
            Développé par{" "}
            <span className="font-medium text-foreground">
              Anthony Ringressi
            </span>
          </span>
          <span className="hidden min-[850px]:inline text-muted-foreground/40">
            ·
          </span>
          <span>
            avec un peu d'aide de son{" "}
            <span className="font-medium text-foreground">
              forgeron IA préféré
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
