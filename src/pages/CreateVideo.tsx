import { useEffect, useRef, useState } from "react";
import { saveStep1, saveTemplateConfig, buildTemplateData, loadStep1, loadTemplateConfig } from "@/utils/saveDefaults";
import { setTemplate, setModeValue, applyTemplateDefaults } from "@/store/createVideoSlice";

import {
  CardFooterCustom,
  CreateVideoSelects,
  CreateVideoSelectDatas,
  RenderProgress,
} from "@/components";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TemplatePreview from "@/components/TemplatePreview";
import PhoneMockup, { PHONE_CHROME_H } from "@/components/PhoneMockup";
import { useAppDispatch, useAppSelector } from "@/store";
import { setJob, updateJob } from "@/store/renderSlice";
import {
  buildRenderBody,
  startRender,
  subscribeToJob,
  cancelRender,
  getVideoObjectUrl,
  downloadVideo,
} from "@/utils/api/render";
import { DownloadIcon } from "lucide-react";
import { getCookiesStatus, postCookies } from "@/utils/api/auth";

// py-12 = 48px * 2 sides = 96px vertical padding on the parent
const screenH = `calc(100vh - 96px - ${PHONE_CHROME_H}px)`;

const STEP_TITLES = ["Template & mode", "Données & paramètres", "Rendu"];

export default function CreateVideo() {
  const dispatch = useAppDispatch();
  const createVideoState = useAppSelector((s) => s.createVideo);
  const job = useAppSelector((s) => s.render.job);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isFetchingCookies, setIsFetchingCookies] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const cleanupRef = useRef<(() => void) | null>(null);

  const step2Valid = createVideoState.clips.every((clip, i) => {
    const isTeaser = i === 0 && createVideoState.teaserTop;
    return clip.title.trim() !== "" && (isTeaser || clip.url.trim() !== "");
  });

  const isRunning =
    job !== null &&
    ["pending", "downloading", "processing"].includes(job.status);
  const isDone = job?.status === "done";

  // Charge les défaults step1 au montage (template + mode uniquement)
  useEffect(() => {
    const s1 = loadStep1();
    if (s1) {
      dispatch(setTemplate(s1.templateValue));
      dispatch(setModeValue(s1.modeValue));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ferme le SSE si on quitte la page
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  // Quand le rendu est terminé, charge la vidéo dans le preview
  useEffect(() => {
    if (job?.status === "done" && job.job_id) {
      getVideoObjectUrl(job.job_id)
        .then(setVideoUrl)
        .catch((err) => console.error("Failed to load video preview:", err));
    }
  }, [job?.status, job?.job_id]);

  // Libère le blob URL quand il change ou que le composant est démonté
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handlePrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleNext = async () => {
    if (currentStep === 2) {
      await handleLaunch();
    } else {
      if (currentStep === 1) {
        const saved = loadTemplateConfig(createVideoState.templateValue);
        if (saved) dispatch(applyTemplateDefaults(saved));
      }
      setCurrentStep((s) => Math.min(3, s + 1));
    }
  };

  const handleLaunch = async () => {
    setLaunchError(null);
    setIsLaunching(true);
    setVideoUrl(null);

    // Sauvegarde step1 si cochée
    if (createVideoState.saveStep1Checked) {
      saveStep1({
        templateValue: createVideoState.templateValue,
        modeValue: createVideoState.modeValue,
      });
    }
    // Sauvegarde step2 (config template) si cochée
    if (createVideoState.saveStep2Checked) {
      saveTemplateConfig(
        createVideoState.templateValue,
        buildTemplateData(createVideoState),
      );
    }

    // Ouvrir la fenêtre YouTube AVANT tout await pour rester dans le contexte du clic utilisateur
    // (après un await, Chrome peut forcer noopener et couper window.opener)
    const ytWindow = window.open("https://www.youtube.com", "_blank", "noopener=no");
    console.log("[cookies] ytWindow opened:", ytWindow, "| opener will be:", ytWindow ? "accessible" : "NULL - popup bloquée");

    try {
      // Vérifie si les cookies YouTube doivent être rafraîchis
      const cookiesStatus = await getCookiesStatus();
      console.log("[cookies] status:", cookiesStatus);
      if (cookiesStatus.needs_refresh) {
        setIsFetchingCookies(true);
        console.log("[cookies] needs_refresh=true, en attente du postMessage...");

        // Écoute tous les messages pour voir ce qui arrive (debug)
        const debugListener = (e: MessageEvent) => {
          console.log("[cookies] message reçu — origin:", e.origin, "| data:", e.data);
        };
        window.addEventListener("message", debugListener);

        try {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              window.removeEventListener("message", handler);
              window.removeEventListener("message", debugListener);
              ytWindow?.close();
              reject(new Error("Extension Chrome non installée ou cookies non reçus"));
            }, 30_000);

            const handler = async (event: MessageEvent) => {
              if (event.data?.type !== "ORPHEE_COOKIES") return;
              console.log("[cookies] ORPHEE_COOKIES reçu !");
              clearTimeout(timeout);
              window.removeEventListener("message", handler);
              window.removeEventListener("message", debugListener);
              try {
                await postCookies(event.data.cookies as string);
                console.log("[cookies] POST /auth/cookies OK");
                resolve();
              } catch {
                reject(new Error("Impossible d'envoyer les cookies au serveur"));
              }
            };

            window.addEventListener("message", handler);
          });
        } finally {
          setIsFetchingCookies(false);
        }
      } else {
        // Pas besoin de refresh, on ferme la fenêtre qu'on avait ouverte
        console.log("[cookies] needs_refresh=false, fermeture de la fenêtre YouTube");
        ytWindow?.close();
      }

      const body = buildRenderBody(createVideoState);
      const job = await startRender(body);
      dispatch(setJob(job));
      cleanupRef.current = subscribeToJob(job.job_id, dispatch);
      setCurrentStep(3);
    } catch (err: unknown) {
      const detail =
        err instanceof Error
          ? err.message
          : (err as { detail?: { message?: string } })?.detail?.message;
      setLaunchError(detail ?? "Impossible de lancer le rendu.");
    } finally {
      setIsLaunching(false);
      setIsFetchingCookies(false);
    }
  };

  const handleCancel = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    const jobId = job?.job_id;
    dispatch(updateJob({ status: "cancelled" }));
    setVideoUrl(null);
    if (jobId) cancelRender(jobId).catch(() => null);
  };

  // ── Footer step 4 ──────────────────────────────────────────────────────────

  const step4Left =
    currentStep === 3 ? (
      isRunning ? (
        <Button
          variant="destructive"
          onClick={handleCancel}
        >
          Annuler
        </Button>
      ) : (
        <Button
          variant="ghost"
          onClick={handlePrev}
        >
          Retour
        </Button>
      )
    ) : undefined;

  const step4Right =
    currentStep === 3 ? (
      isDone && job?.job_id ? (
        <Button onClick={() => downloadVideo(job.job_id).catch((err) => console.error("Download failed:", err))}>
          <DownloadIcon className="size-4" />
          Télécharger
        </Button>
      ) : (
        <div className="w-30.5" /> // placeholder pour garder le centrage
      )
    ) : undefined;

  return (
    <section className="flex gap-12 px-12">
      <div className="w-full h-[calc(100vh-3.5rem)] py-12">
        <Card className="h-full">
          <CardHeader className="justify-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {STEP_TITLES[currentStep - 1]}
            </h3>
          </CardHeader>

          <Separator />

          <div className="overflow-scroll p-4 pt-0 h-full flex flex-col gap-4">
            {currentStep === 1 && <CreateVideoSelects />}
            {currentStep === 2 && (
              <>
                <CreateVideoSelectDatas />
                {launchError && (
                  <p className="text-sm text-destructive">{launchError}</p>
                )}
              </>
            )}
            {currentStep === 3 && <RenderProgress />}
          </div>

          <CardFooterCustom
            currentStep={currentStep}
            onPrev={handlePrev}
            onNext={handleNext}
            nextLabel={currentStep === 2 ? (isFetchingCookies ? "Récupération des cookies YouTube..." : "Lancer le rendu") : undefined}
            nextDisabled={(currentStep === 2 && !step2Valid) || isLaunching || isFetchingCookies}
            showPrev={currentStep > 1}
            leftAction={step4Left}
            rightAction={step4Right}
          />
        </Card>
      </div>

      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] py-12">
        <PhoneMockup>
          <div style={{ height: screenH, aspectRatio: "9/16" }}>
            {currentStep === 3 && videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                playsInline
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <TemplatePreview mode={currentStep === 1 ? "fake" : "live"} />
            )}
          </div>
        </PhoneMockup>
      </div>
    </section>
  );
}
