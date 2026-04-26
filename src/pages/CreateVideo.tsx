import { useEffect, useRef, useState } from "react";
import {
  saveStep1,
  saveTemplateConfig,
  buildTemplateData,
  loadStep1,
  loadTemplateConfig,
} from "@/utils/saveDefaults";
import {
  setTemplate,
  setModeValue,
  applyTemplateDefaults,
} from "@/store/createVideoSlice";

import {
  CardFooterCustom,
  CreateVideoSelects,
  CreateVideoSelectDatas,
  RenderJobContent,
} from "@/components";
import { Button } from "@/components/ui/button";
import TemplatePreview from "@/components/TemplatePreview";
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

// ─── Extension Chrome ─────────────────────────────────────────────────────────

const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID as string;

function getYoutubeCookiesFromExtension(): Promise<string> {
  return new Promise((resolve, reject) => {
    const cr = (
      window as unknown as {
        chrome?: {
          runtime?: {
            sendMessage: (...args: unknown[]) => void;
            lastError?: { message: string };
          };
        };
      }
    ).chrome;
    if (!cr?.runtime) {
      reject(new Error("Extension Chrome non installée"));
      return;
    }
    cr.runtime.sendMessage(
      EXTENSION_ID,
      { type: import.meta.env.VITE_EXTENSION_MESSAGE_TYPE },
      (response: unknown) => {
        if (cr.runtime?.lastError) {
          reject(new Error(cr.runtime.lastError.message));
          return;
        }
        const r = response as { cookies?: string } | null;
        if (!r?.cookies) {
          reject(new Error("Aucun cookie stocké dans l'extension"));
          return;
        }
        resolve(r.cookies);
      },
    );
  });
}


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

    if (createVideoState.saveStep1Checked) {
      saveStep1({
        templateValue: createVideoState.templateValue,
        modeValue: createVideoState.modeValue,
      });
    }
    if (createVideoState.saveStep2Checked) {
      saveTemplateConfig(
        createVideoState.templateValue,
        buildTemplateData(createVideoState),
      );
    }

    try {
      const cookiesStatus = await getCookiesStatus();
      if (cookiesStatus.needs_refresh) {
        setIsFetchingCookies(true);
        try {
          const cookies = await getYoutubeCookiesFromExtension();
          await postCookies(cookies);
        } finally {
          setIsFetchingCookies(false);
        }
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
        <Button
          onClick={() =>
            downloadVideo(job.job_id).catch((err) =>
              console.error("Download failed:", err),
            )
          }
        >
          <DownloadIcon className="size-4" />
          Télécharger
        </Button>
      ) : (
        <div className="w-30.5" /> // placeholder pour garder le centrage
      )
    ) : undefined;

  return (
    <section className="flex gap-12 px-12">
      <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col">

        {/* Header */}
        <div className="shrink-0 pt-8 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Étape {currentStep}/3
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
            {STEP_TITLES[currentStep - 1]}
          </h2>
        </div>

        <div className="h-px bg-border shrink-0" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-6 flex flex-col gap-4">
          {currentStep === 1 && <CreateVideoSelects />}
          {currentStep === 2 && (
            <>
              <CreateVideoSelectDatas />
              {launchError && (
                <p className="text-sm text-destructive">{launchError}</p>
              )}
            </>
          )}
          {currentStep === 3 && <RenderJobContent />}
        </div>

        <div className="h-px bg-border shrink-0" />

        {/* Bottom bar */}
        <CardFooterCustom
          currentStep={currentStep}
          onPrev={handlePrev}
          onNext={handleNext}
          nextLabel={
            currentStep === 2
              ? isFetchingCookies
                ? "Récupération des cookies..."
                : "Lancer le rendu"
              : undefined
          }
          nextDisabled={
            (currentStep === 2 && !step2Valid) ||
            isLaunching ||
            isFetchingCookies
          }
          showPrev={currentStep > 1}
          leftAction={step4Left}
          rightAction={step4Right}
        />
      </div>

      <div className="flex flex-col h-[calc(100vh-3.5rem)] py-8 shrink-0">

        {/* Header */}
        <div className="shrink-0 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-px bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">
              Aperçu
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
            {currentStep === 3
              ? isDone ? "Rendu final" : isRunning ? "En cours…" : "Rendu"
              : createVideoState.templateValue.charAt(0).toUpperCase() + createVideoState.templateValue.slice(1)}
          </h2>
        </div>

        <div className="h-px bg-border shrink-0" />

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center pt-6">
          <div
            className="border border-border rounded-2xl overflow-hidden shrink-0"
            style={{ height: "calc(100vh - 3.5rem - 4rem - 100px)", aspectRatio: "9/16" }}
          >
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
        </div>

      </div>
    </section>
  );
}
