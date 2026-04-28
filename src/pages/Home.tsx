import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicMetrics, type PublicMetrics } from "@/utils/api/render";
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
  QrCodeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import TemplatePreview from "@/components/TemplatePreview";
import { useAppSelector } from "@/store";
import { templates } from "@/utils";
import { FAKE_PREVIEW } from "@/utils/constants/fakePreview.constants";
import youtubePreviewDark from "/images/preview-youtube-dark.png";
import youtubePreviewLight from "/images/preview-youtube-light.png";
import configurationPreviewDark from "/images/preview-configuration-dark.png";
import configurationPreviewLight from "/images/preview-configuration-light.png";
import downloadPreviewDark from "/images/preview-download-dark.png";
import downloadPreviewLight from "/images/preview-download-light.png";
import { useTheme } from "@/utils/useTheme";

// ── Template Gif Carousel ────────────────────────────────────────────────────

function TemplateGifCarousel({
  onActiveChange,
}: {
  onActiveChange: (tpl: (typeof templates)[0]) => void;
}) {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  const [carouselH, setCarouselH] = useState(() =>
    window.innerWidth < 768 ? 280 : 400,
  );
  useEffect(() => {
    const handler = () => setCarouselH(window.innerWidth < 768 ? 280 : 400);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const carouselW = Math.round((carouselH * 9) / 16);

  const goTo = useCallback((i: number) => {
    setActive(i);
    onActiveChangeRef.current(templates[i]);
  }, []);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % templates.length;
        onActiveChangeRef.current(templates[next]);
        return next;
      });
    }, 4000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  const go = (dir: 1 | -1) => {
    const next = (active + dir + templates.length) % templates.length;
    goTo(next);
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
                goTo(i);
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
    imageLight: configurationPreviewLight,
    imageDark: configurationPreviewDark,
  },
  {
    step: "03",
    title: "Ajoute tes sources vidéo",
    description:
      "Colle n'importe quel lien vidéo ou utilise la recherche intégrée pour trouver directement sur YouTube.",
    imageLight: youtubePreviewLight,
    imageDark: youtubePreviewDark,
  },
  {
    step: "04",
    title: "Lance le rendu & télécharge",
    description:
      'Un clic sur "Lancer le rendu". Le serveur traite et assemble ta vidéo. Tu suis la progression en direct — si le résultat te plaît, tu télécharges directement depuis l\'app.',
    imageLight: downloadPreviewLight,
    imageDark: downloadPreviewDark,
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
  const { isDark } = useTheme();
  return (
    <div
      ref={ref}
      className={`flex flex-col gap-8 md:flex-row md:items-center md:gap-16 transition-all duration-700 ease-out ${
        i % 2 === 1 ? "md:flex-row-reverse" : ""
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
    >
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center size-7 rounded-full border border-violet-400/40 bg-violet-400/10 text-[11px] font-bold text-violet-400 font-mono shrink-0">
            {s.step}
          </span>
        </div>
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
        ) : (
          <img
            src={isDark ? s.imageLight : s.imageDark}
            alt={s.title}
            className="w-full rounded-2xl border border-border shadow-lg object-cover"
          />
        )}
      </div>
    </div>
  );
}

// ── Workflow Section (sticky left + horizontal scroll) ─────────────────────────

function WorkflowSection() {
  const { isDark } = useTheme();
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [tx, setTx] = useState(0);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Mesure la largeur dispo pour les cards
  useEffect(() => {
    const measure = () => {
      if (rightRef.current) setCardWidth(rightRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll → translateX discret (une card à la fois)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section || !cardWidth) return;
        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top) / scrollable);
        const idx = Math.min(
          STEPS.length - 1,
          Math.floor(progress * STEPS.length),
        );
        setActiveIdx(idx);
        setTx(idx * cardWidth);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [cardWidth]);

  const scrollToStep = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    isProgrammaticScrollRef.current = true;
    setActiveIdx(i);
    setTx(i * cardWidth);
    if (programmaticTimeoutRef.current)
      clearTimeout(programmaticTimeoutRef.current);
    programmaticTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 900);
    const scrollable = section.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: section.offsetTop + (i / STEPS.length) * scrollable,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Mobile — layout vertical */}
      <section className="lg:hidden relative px-6 py-10 flex flex-col gap-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-600 blur-[80px] opacity-40" />
        <div className="pointer-events-none absolute bottom-0 -left-16 w-56 h-56 rounded-full bg-indigo-500 blur-[70px] opacity-30" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Workflow
            </span>
          </div>
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

      {/* Desktop — sticky top header + full-width horizontal scroll */}
      <div
        ref={sectionRef}
        className="hidden lg:block"
        style={{ height: `${STEPS.length * 120}vh` }}
      >
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
          {/* Background glows */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-600 blur-[130px] opacity-15" />
          <div className="pointer-events-none absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-indigo-500 blur-[90px] opacity-25" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-50 rounded-full bg-blue-600 blur-[120px] opacity-15" />
          {/* ── Top bar : title + step nav ── */}
          <div className="shrink-0 flex items-end justify-between gap-8 px-12 xl:px-16 pt-8 pb-5 border-b border-border/40">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-px bg-violet-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                  Workflow
                </span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-black uppercase tracking-tighter leading-tight">
                Comment ça marche
              </h2>
              <p className="text-sm text-muted-foreground">
                Quatre étapes, quelques minutes.
              </p>
            </div>

            <div className="flex items-stretch gap-0 shrink-0">
              {STEPS.map((s, i) => (
                <button
                  key={s.step}
                  onClick={() => scrollToStep(i)}
                  className={`relative flex flex-col items-start gap-0.5 px-5 py-2.5 transition-all duration-300 border-t-2 ${
                    i === activeIdx
                      ? "border-violet-400 opacity-100"
                      : "border-transparent opacity-30 hover:opacity-60"
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono font-bold ${i === activeIdx ? "text-violet-400" : "text-muted-foreground"}`}
                  >
                    {s.step}
                  </span>
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Bottom : full-width horizontal scroll track ── */}
          <div
            ref={rightRef}
            className="flex-1 overflow-hidden"
          >
            <div
              className="flex h-full will-change-transform"
              style={{
                width: cardWidth ? cardWidth * STEPS.length : "400%",
                transform: `translateX(-${tx}px)`,
                transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {STEPS.map((s, i) => (
                <div
                  key={s.step}
                  className="h-full shrink-0 flex items-center gap-14 px-14"
                  style={{ width: cardWidth || "25%" }}
                >
                  {/* Texte */}
                  <div className="flex flex-col gap-4 max-w-sm shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-violet-400" />
                      <span className="text-[20px] font-bold tracking-[0.2em] text-violet-400 uppercase font-mono">
                        {s.step}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {s.description}
                    </p>
                    {i === 0 && (
                      <div className="flex flex-col gap-1.5 pt-1 border-t border-border">
                        <div className="flex items-center gap-1.5 mt-2">
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

                  {/* Visuel */}
                  <div className="flex-1 h-[70%] flex items-center justify-center">
                    {"carousel" in s && s.carousel ? (
                      <TemplateGifCarousel onActiveChange={setActiveTemplate} />
                    ) : (
                      <img
                        src={isDark ? s.imageLight : s.imageDark}
                        alt={s.title}
                        className="max-w-full max-h-full object-contain rounded-2xl"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
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
          "Colle n'importe quelle URL vidéo compatible yt-dlp. YouTube en priorité, mais pas uniquement.",
      },
      {
        icon: VideoIcon,
        label: "Recherche YouTube",
        description:
          "Recherche directement sur YouTube depuis l'app sans quitter la page. Sélectionne et ajoute un clip en un clic.",
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
          "Base de données intégrée des musiques dépassant 1 milliard de streams sur Spotify. Recherche par titre, artiste ou album.",
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
          "Colorpicker ou saisie hexadécimale pour chaque texte. Épaisseur de bordure réglable indépendamment sur titre et sous-titre.",
      },
      {
        icon: WandIcon,
        label: "5 animations",
        description:
          "Aucune, fondu, machine à écrire, glissement gauche, glissement bas — applicables indépendamment au titre et sous-titre.",
      },
      {
        icon: AlignLeftIcon,
        label: "Position du texte",
        description:
          "Aligné à gauche ou centré. Applicable clip par clip ou à tous en un clic.",
      },
    ],
  },
  {
    category: "Paramètres rendu",
    items: [
      {
        icon: LayersIcon,
        label: "Fond personnalisable",
        description:
          "Vidéo floutée, blanc, noir ou couleur custom via colorpicker. Chaque changement est visible en temps réel dans la prévisualisation.",
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
          "Fondu enchaîné entre chaque clip. Activable par toggle, durée configurable de 0.1s à 2s.",
      },
      {
        icon: DropletIcon,
        label: "Filigrane",
        description:
          "Texte watermark en bas de la vidéo. Police, taille, couleur et opacité configurables.",
      },
    ],
  },
  {
    category: "Prévisualisation",
    items: [
      {
        icon: SmartphoneIcon,
        label: "Preview 9:16 live",
        description:
          "Chaque modification est reflétée instantanément dans un rendu CSS fidèle du résultat final en 1080×1920.",
      },
      {
        icon: SparklesIcon,
        label: "Aperçu highlight actif",
        description:
          "Simule l'animation de mise en avant clip par clip dans la preview, du dernier vers le premier.",
      },
      {
        icon: BookmarkIcon,
        label: "Sauvegarde des paramètres",
        description:
          "Template, mode et réglages de style sont sauvegardés automatiquement et restaurés à chaque session.",
      },
      {
        icon: QrCodeIcon,
        label: "QR code mobile",
        description:
          "Une fois le rendu terminé, un QR code s'affiche. Scanne-le pour voir et télécharger la vidéo directement depuis ton téléphone.",
      },
    ],
  },
];

// ── Features Section ─────────────────────────────────────────────────────────

function FeaturesSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(true);
  const { ref, visible } = useInView(0.05);

  const switchGroup = (i: number) => {
    if (i === activeIdx) return;
    setCardsVisible(false);
    setTimeout(() => {
      setActiveIdx(i);
      setCardsVisible(true);
    }, 220);
  };

  const group = FEATURE_GROUPS[activeIdx];

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden px-6 py-12 lg:px-12 lg:py-16 flex flex-col gap-10 transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      <div className="pointer-events-none absolute -bottom-16 -right-20 w-72 h-72 rounded-full bg-blue-500 blur-[80px] opacity-25" />
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Features
            </span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-black uppercase tracking-tighter leading-tight">
            Tout ce que tu peux
            <br />
            configurer
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Contrôle total sur les données, le style et le rendu.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {FEATURE_GROUPS.map((g, i) => (
            <button
              key={g.category}
              onClick={() => switchGroup(i)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                i === activeIdx
                  ? "bg-violet-400 border-violet-400 text-white"
                  : "border-border text-muted-foreground hover:border-violet-400/40 hover:text-foreground"
              }`}
            >
              {g.category}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {group.items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={`${activeIdx}-${item.label}`}
              className="group flex flex-col gap-3 rounded-xl border border-border hover:border-violet-400/40 bg-background hover:bg-violet-400/5 p-5 h-full transition-all duration-300"
              style={{
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 300ms ease-out ${idx * 60}ms, transform 300ms ease-out ${idx * 60}ms, border-color 200ms, background-color 200ms`,
              }}
            >
              <div className="size-8 rounded-md bg-violet-400/10 flex items-center justify-center shrink-0">
                <Icon className="size-4 text-violet-400" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">{item.label}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2">
        {FEATURE_GROUPS.map((_, i) => (
          <button
            key={i}
            onClick={() => switchGroup(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIdx
                ? "w-6 bg-violet-400"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

const heroAnim = (delay: number): React.CSSProperties => ({
  animation: `hero-fade-up 0.7s ease-out ${delay}ms both`,
});

const TYPEWRITER_EXAMPLES = [
  "TOP 5 THE WEEKND.",
  "EXTRAIT IRON MAN 3.",
  "TOP 10 SONS SPOTIFY.",
  "DERNIER BUT DE MBAPPÉ.",
  "COMBAT NARUTO SASUKE.",
  "TOP FILMS 2026.",
  "MEILLEUR ALBUM SPOTIFY.",
  "TOP CLIPS RÉCENTS.",
  "HIGHLIGHT PSG.",
  "MEILLEURS CLIPS ADÈLE.",
];

function useTypewriter(lines: string[]) {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    const current = lines[lineIdx];
    let t: ReturnType<typeof setTimeout>;
    if (!erasing) {
      if (displayed < current.length) {
        t = setTimeout(() => setDisplayed((d) => d + 1), 55);
      } else {
        t = setTimeout(() => setErasing(true), 2200);
      }
    } else {
      if (displayed > 0) {
        t = setTimeout(() => setDisplayed((d) => d - 1), 28);
      } else {
        t = setTimeout(() => {
          setErasing(false);
          setLineIdx((i) => (i + 1) % lines.length);
        }, 0);
      }
    }
    return () => clearTimeout(t);
  }, [erasing, displayed, lineIdx, lines]);

  const typing = !erasing && displayed < lines[lineIdx].length;
  return { text: lines[lineIdx].slice(0, displayed), typing };
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ""}`;
  if (m > 0) return `${m}min`;
  return `${seconds}s`;
}

export default function Home() {
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);

  useEffect(() => {
    getPublicMetrics().then(setMetrics).catch(() => {});
  }, []);

  const isMobileSafari =
    /iP(hone|ad|od)/.test(navigator.userAgent) &&
    /WebKit/.test(navigator.userAgent) &&
    !/CriOS|FxiOS|OPiOS/.test(navigator.userAgent);
  const { text: twText, typing: twTyping } = useTypewriter(TYPEWRITER_EXAMPLES);

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
      <section className="relative flex flex-col items-center justify-center text-center px-6 gap-0 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Orbs */}
        <div
          ref={orb1Ref}
          className="pointer-events-none absolute -top-16 -left-8 w-64 h-64 lg:-top-40 lg:-left-20 lg:w-150 lg:h-150 rounded-full bg-violet-600 blur-[80px] lg:blur-[130px] will-change-transform opacity-70 lg:opacity-100"
          style={{ animation: "orb-pulse-1 7s ease-in-out infinite" }}
        />
        <div
          ref={orb2Ref}
          className="pointer-events-none absolute -top-10 -right-8 w-56 h-56 lg:-top-20 lg:-right-20 lg:w-125 lg:h-125 rounded-full bg-blue-500 blur-[70px] lg:blur-[110px] will-change-transform opacity-60 lg:opacity-100"
          style={{ animation: "orb-pulse-2 10s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 rounded-full bg-indigo-500 blur-[150px]"
          style={{ animation: "orb-pulse-3 13s ease-in-out infinite" }}
        />
        {/* Mobile only: soft bottom glow to anchor the bg */}
        <div className="pointer-events-none lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full bg-violet-700 blur-[90px] opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_20%,hsl(var(--background)/0.9)_80%)]" />

        {/* Badge */}
        <div
          style={heroAnim(0)}
          className="relative z-10 mb-6 lg:mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 lg:px-4 py-1.5 text-[10px] font-bold tracking-[0.15em] lg:tracking-[0.2em] text-violet-400 uppercase">
            <span className="size-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline">
              GÉNÉRATION AUTOMATISÉE DE VIDÉOS
            </span>
            <span className="sm:hidden">GÉNÉRATION DE VIDÉOS</span>
          </span>
        </div>

        {/* Headline */}
        <h1
          className="relative z-10 flex flex-col items-center gap-2 lg:gap-0 mb-8 lg:mb-10 font-black uppercase tracking-tighter leading-[0.92] w-full max-w-[95vw] text-center"
          style={{ fontSize: "clamp(2.4rem, 8vw, 6.5rem)" }}
        >
          <span
            style={heroAnim(150)}
            className="text-foreground"
          >
            Vexia Studio
          </span>
          <span
            style={heroAnim(300)}
            className="text-violet-400"
          >
            Générateur de <span className="whitespace-nowrap">vidéo :</span>
          </span>
          <span
            style={heroAnim(450)}
            className="text-foreground"
          >
            {twText}
            <span
              className="inline-block w-[0.06em] h-[0.75em] bg-foreground ml-1 align-middle"
              style={{
                animation: twTyping
                  ? undefined
                  : "cursor-blink 1s step-end infinite",
                opacity: twTyping ? 1 : undefined,
              }}
            />
          </span>
        </h1>

        {/* CTAs */}
        <div
          style={heroAnim(800)}
          className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mb-8 lg:mb-12 w-full sm:w-auto px-4 sm:px-0"
        >
          <Button
            size="lg"
            className="h-12 w-full sm:w-auto px-8 text-sm font-bold tracking-wide uppercase"
            onClick={() => navigate(token ? "/create-video" : "/logging")}
          >
            {token ? "Créer une vidéo" : "Se connecter"}
            <ArrowRightIcon className="size-4" />
          </Button>
          {token && (
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full sm:w-auto px-8 text-sm font-bold tracking-wide uppercase"
              onClick={() => navigate("/user")}
            >
              Dernier rendu
            </Button>
          )}
        </div>

        {/* Stats */}
        <div
          style={heroAnim(1000)}
          className="relative z-10 grid grid-cols-2 sm:flex rounded-xl border border-border overflow-hidden"
        >
          {[
            { value: "100%", label: "personnalisable" },
            { value: "5 MIN", label: "de rendu" },
            { value: metrics ? String(metrics.total_clips_used) : "—", label: "clips utilisés" },
            { value: metrics ? String(metrics.total_videos_created) : "—", label: "vidéos créées" },
            { value: metrics ? formatDuration(metrics.total_duration_seconds) : "—", label: "de contenu" },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-0.5 px-5 py-3
                ${i % 2 === 0 && i !== 4 ? "border-r border-border" : ""}
                ${i < 4 ? "border-b border-border sm:border-b-0" : ""}
                ${i > 0 && i < 4 ? "sm:border-r sm:border-border" : ""}
              `}
            >
              <span className="text-lg font-black tracking-tight uppercase">
                {value}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <WorkflowSection />

      <Separator />

      <FeaturesSection />

      <Separator />
      <section className="relative overflow-hidden px-6 py-16 lg:py-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-150 h-75 rounded-full bg-violet-600 blur-[120px] opacity-20" />
        </div>

        <FadeIn className="relative z-10 flex flex-col items-center text-center gap-8">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
            <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
            Prêt à créer ?
          </span>

          {/* Headline */}
          <h2
            className="font-black uppercase tracking-tighter leading-[0.92] text-center"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            <span className="text-foreground">Quelques minutes</span>
            <br />
            <span className="text-violet-400">pour une vidéo pro.</span>
          </h2>

          {/* Sub */}
          <div className="grid gap-1 text-muted-foreground max-w-sm text-sm leading-relaxed">
            <p>Choisis un template, colle tes liens, lance le rendu.</p>
            <p>Ta vidéo est prête à publier.</p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              size="lg"
              className="h-12 w-full sm:w-auto px-10 text-sm font-bold tracking-wide uppercase hidden lg:flex"
              onClick={() => navigate(token ? "/create-video" : "/logging")}
            >
              {token ? "Créer une vidéo" : "Se connecter"}
              <ArrowRightIcon className="size-4" />
            </Button>
            <div className="lg:hidden inline-flex items-center gap-2 rounded-full border border-border px-4 py-2">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Disponible uniquement sur ordinateur
              </span>
            </div>
          </div>
        </FadeIn>
      </section>

      <Separator />
      <section className="relative overflow-hidden px-6 py-12 lg:px-12 lg:py-16 flex flex-col gap-10">
        <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-600 blur-[110px] opacity-15" />
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-px bg-violet-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                Tech
              </span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-black uppercase tracking-tighter leading-tight">
              Stack technique
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Deux services, un pipeline.
            </p>
          </div>
        </FadeIn>

        {/* Pipeline — deux cartes côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
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
              delay={idx * 150}
            >
              <div className="relative rounded-2xl border border-violet-400/25 bg-muted/10 overflow-hidden flex flex-col h-full hover:border-violet-400/50 transition-colors duration-300">
                {/* Card content */}
                <div className="flex flex-col gap-6 p-6 lg:p-8 flex-1">
                  {/* Identity */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-px bg-violet-400" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
                          {s.role}
                        </span>
                      </div>
                      <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none mt-0.5">
                        {s.name}
                      </h3>
                    </div>
                    <a
                      href={s.repo}
                      target={isMobileSafari ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase border border-border rounded-full px-3 py-1.5 hover:border-violet-400/40 hover:text-violet-400 transition-colors duration-200 mt-1"
                    >
                      Repo <ArrowUpRightIcon className="size-3" />
                    </a>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Tech groups */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                    {s.groups.map(({ label, items }) => (
                      <div
                        key={label}
                        className="flex flex-col gap-2"
                      >
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
                          {label}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {items.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-semibold bg-muted/80 border border-border/60 rounded-md px-2 py-0.5"
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

      <footer className="px-6 lg:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Vexia Studio
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Générateur de vidéos short-form
          </p>
        </div>

        {/* Credits */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Développé par</span>
          <a
            href="https://www.linkedin.com/in/anthony-ringressi/"
            target={isMobileSafari ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className="font-semibold text-foreground border-b border-foreground/30 hover:border-foreground transition-colors duration-200"
          >
            Anthony Ringressi
          </a>
          <span>et Claude le bg</span>
        </div>
      </footer>
    </div>
  );
}
