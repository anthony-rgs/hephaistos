type Props = {
  label: string;
  description: string;
  tags: string[];
  imgReference: string;
  features: string[];
};

export const templates: Props[] = [
  {
    label: "top",
    description:
      "La liste de tes clips s'affiche en haut, la vidéo tourne en bas. Parfait pour les tops, classements et countdowns.",
    tags: ["Classement", "Multi-clips"],
    imgReference: "",
    features: [
      "background", // tabs ? toggle ?
      "smoothTransition", // toggle -> affichage int input
      "watermark", // toggle -> affichage couleur, opacité, size et text
      "globalTitle",
      "videoMargin", // toggle et si oui alors int input
      "id",
      "highlightActive", // toggle et si oui flex-between et couleur picker avec default value
      "teaserTop", // proposé toggle au niveau du titre + int input avec default value pour demander combien de temps d'affichage
    ],
  },
  {
    label: "classic",
    description:
      "Un header avec ton titre global, la vidéo centrée, et les infos du clip juste au-dessus. Équilibré et lisible.",
    tags: ["Titre global", "Propre"],
    imgReference: "",
    features: [
      "background",
      "smoothTransition",
      "watermark",
      "globalTitle",
      "spacing",
      "videoMargin",
      "secondTitle",
    ],
  },
  {
    label: "minimal",
    description:
      "Pas de header, la vidéo occupe l'espace. Seuls le titre et le sous-titre flottent au-dessus. Rien de superflu.",
    tags: ["Simple", "Focus vidéo"],
    imgReference: "/",
    features: [
      "background",
      "smoothTransition",
      "watermark",
      "spacing",
      "videoMargin",
      "secondTitle",
    ],
  },
  {
    label: "expanded",
    description:
      "La vidéo prend presque tout l'écran. Le titre s'affiche dans un petit bandeau en haut. Impact visuel maximum.",
    tags: ["Plein écran", "Immersif"],
    imgReference: "/",
    features: [
      "background",
      "smoothTransition",
      "watermark",
      "spacing",
      "secondTitle",
    ],
  },
];
