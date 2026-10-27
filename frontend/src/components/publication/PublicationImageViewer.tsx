"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { getStrapiMediaUrl } from "../../api/strapi-media";
import type { ImageComponent } from "../../api/publication-model";
import { useI18n } from "../../i18n/I18nProvider";

const ZOOM_STEP = 0.5;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const controlButtonSx = {
  color: "white",
  bgcolor: "grey.800",
  "&:hover": {
    bgcolor: "grey.700",
  },
  "&.Mui-disabled": {
    color: "white",
    bgcolor: "grey.500",
    opacity: 1,
  },
};

type Position = {
  x: number;
  y: number;
};

type PublicationImageViewerProps = {
  images: ImageComponent[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export function PublicationImageViewer({
  images,
  currentIndex,
  open,
  onClose,
  onChangeIndex,
}: PublicationImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ origin: Position; pointer: Position } | null>(null);
  const hasDraggedRef = useRef(false);

  const { t } = useI18n();
  const image = images[currentIndex];
  const imageUrl = image ? getStrapiMediaUrl(image.image) : "";
  const altText = image ? image.image.alternativeText || image.description || "" : "";

  const clampPosition = useCallback(
    (next: Position): Position => {
      const img = imageRef.current;
      const container = containerRef.current;
      if (!img || !container || zoom <= MIN_ZOOM) return { x: 0, y: 0 };

      const containerRect = container.getBoundingClientRect();
      const scaledWidth = img.offsetWidth * zoom;
      const scaledHeight = img.offsetHeight * zoom;

      const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
      const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

      return {
        x: Math.max(-maxX, Math.min(maxX, next.x)),
        y: Math.max(-maxY, Math.min(maxY, next.y)),
      };
    },
    [zoom],
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handlePrevious = useCallback(() => {
    resetView();
    onChangeIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onChangeIndex, resetView]);

  const handleNext = useCallback(() => {
    resetView();
    onChangeIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onChangeIndex, resetView]);

  const handleZoomIn = useCallback(() => {
    setZoom((value) => {
      const nextZoom = Math.min(value + ZOOM_STEP, MAX_ZOOM);
      return nextZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((value) => {
      const nextZoom = Math.max(value - ZOOM_STEP, MIN_ZOOM);
      return nextZoom;
    });
  }, []);

  useEffect(() => {
    setPosition((current) => clampPosition(current));
  }, [zoom, clampPosition]);

  useEffect(() => {
    if (!open) {
      resetView();
    }
  }, [open, resetView]);

  useEffect(() => {
    if (!open) return undefined;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((value) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value + delta)));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrevious, handleNext, onClose]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (zoom <= MIN_ZOOM) return;

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      dragStartRef.current = {
        origin: { x: position.x, y: position.y },
        pointer: { x: event.clientX, y: event.clientY },
      };
      hasDraggedRef.current = false;
    },
    [position, zoom],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current || zoom <= MIN_ZOOM) return;

      const deltaX = event.clientX - dragStartRef.current.pointer.x;
      const deltaY = event.clientY - dragStartRef.current.pointer.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        hasDraggedRef.current = true;
      }

      setPosition(
        clampPosition({
          x: dragStartRef.current.origin.x + deltaX,
          y: dragStartRef.current.origin.y + deltaY,
        }),
      );
    },
    [clampPosition, zoom],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      dragStartRef.current = null;

      if (!hasDraggedRef.current) {
        setZoom((value) =>
          value > MIN_ZOOM ? MIN_ZOOM : Math.min(value + ZOOM_STEP, MAX_ZOOM),
        );
      }
      hasDraggedRef.current = false;
    },
    [],
  );

  const transformStyle = useMemo(
    () => ({
      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
      cursor: zoom > MIN_ZOOM ? (dragStartRef.current ? "grabbing" : "grab") : "zoom-in",
    }),
    [position, zoom],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.92)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 1,
          zIndex: 1,
        }}
      >
        <IconButton aria-label={t.media.zoomOut} onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} sx={controlButtonSx}>
          <ZoomOutIcon />
        </IconButton>
        <IconButton aria-label={t.media.zoomIn} onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM} sx={controlButtonSx}>
          <ZoomInIcon />
        </IconButton>
        <IconButton aria-label={t.media.close} onClick={onClose} sx={controlButtonSx}>
          <CloseIcon />
        </IconButton>
      </Box>

      {images.length > 1 && (
        <>
          <IconButton
            aria-label={t.media.previous}
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              ...controlButtonSx,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label={t.media.next}
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              ...controlButtonSx,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      {imageUrl && (
        <Box
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          sx={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none",
          }}
        >
          <Box
            sx={{
              transition: dragStartRef.current ? "none" : "transform 0.2s ease-in-out",
              maxWidth: "100%",
              maxHeight: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...transformStyle,
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt={altText}
              draggable={false}
              onLoad={() => setPosition((current) => clampPosition(current))}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                display: "block",
                userSelect: "none",
              }}
            />
          </Box>
        </Box>
      )}

      {images.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            color: "white",
            typography: "caption",
          }}
        >
          {currentIndex + 1} / {images.length}
        </Box>
      )}
    </Dialog>
  );
}
