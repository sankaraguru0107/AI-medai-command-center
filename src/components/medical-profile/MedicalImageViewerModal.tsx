import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Download, Maximize2,
  Minimize2, ChevronLeft, ChevronRight, Eye, Sun, Moon, FileText,
  Building2, User, Clock, ShieldCheck, Activity, Printer, Info
} from 'lucide-react';
import { ImagingScanItem } from '../../types/medicalRecord';

interface MedicalImageViewerModalProps {
  scan: ImagingScanItem | null;
  onClose: () => void;
}

export const MedicalImageViewerModal: React.FC<MedicalImageViewerModalProps> = ({
  scan,
  onClose,
}) => {
  if (!scan) return null;

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const images = scan.images || [];
  const currentImage = images[currentImageIndex] || images[0];

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotationDeg(0);
    setIsInverted(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full max-w-6xl h-[92vh]'
          }`}
        >
          {/* TOP BAR / DICOM HEADER */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30">
                <Activity size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-base text-slate-100">
                    {scan.scanType} — {scan.bodyPart}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-primary-400 border border-slate-700">
                    DICOM PACS READY
                  </span>
                  {scan.isVerified && (
                    <span className="badge-success text-[10px] py-0.5">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {scan.facility} · Date: {scan.date} · Radiologist: {scan.radiologist}
                </p>
              </div>
            </div>

            {/* Top action tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowMetadataPanel(!showMetadataPanel)}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  showMetadataPanel
                    ? 'bg-primary-600 text-white border-primary-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Toggle Radiologist Report & Findings"
              >
                <FileText size={15} />
                <span className="hidden sm:inline">Report Summary</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700"
                title="Print Report"
              >
                <Printer size={15} />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 hover:bg-slate-700 transition-colors"
                title="Close Viewer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* MAIN VIEWPORT: LEFT IMAGE CANVAS + RIGHT REPORT PANEL */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* CANVAS & TOOLBAR CONTAINER */}
            <div className="flex-1 flex flex-col bg-black min-h-0 relative">
              {/* Floating Tool Controls Bar */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.25))}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-[11px] font-mono font-bold text-primary-400 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>

                <div className="w-[1px] h-4 bg-slate-700 mx-1" />

                <button
                  onClick={() => setRotationDeg(prev => (prev + 90) % 360)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  title="Rotate 90°"
                >
                  <RotateCw size={16} />
                </button>

                <button
                  onClick={() => setIsInverted(!isInverted)}
                  className={`p-2 rounded-xl transition-all ${
                    isInverted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Invert Contrast (Negative Mode)"
                >
                  <Sun size={16} />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  title="Reset Orientation & Zoom"
                >
                  <RefreshCw size={15} />
                </button>
              </div>

              {/* Central Viewport Image */}
              <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative select-none">
                {currentImage ? (
                  <motion.div
                    key={currentImage.id}
                    animate={{ scale: zoomLevel, rotate: rotationDeg }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ filter: isInverted ? 'invert(1) hue-rotate(180deg)' : 'none' }}
                    className="max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                  >
                    <img
                      src={currentImage.url}
                      alt={currentImage.label}
                      className="max-h-[60vh] max-w-[90vw] object-contain rounded-xl shadow-2xl pointer-events-none"
                    />
                  </motion.div>
                ) : (
                  <div className="text-slate-600 text-sm">No image available in this study.</div>
                )}

                {/* Series Navigation Arrows (If multiple images) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700/80 shadow-xl transition-all hover:scale-105"
                      title="Previous Slice"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700/80 shadow-xl transition-all hover:scale-105"
                      title="Next Slice"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Bottom Overlay Slice Info */}
                {currentImage && (
                  <div className="absolute bottom-4 left-4 p-2.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-3">
                    <span className="font-bold text-primary-400">
                      Series: {currentImageIndex + 1} / {images.length}
                    </span>
                    <span className="text-slate-300">{currentImage.label}</span>
                    {currentImage.resolution && (
                      <span className="text-slate-500">[{currentImage.resolution}]</span>
                    )}
                  </div>
                )}
              </div>

              {/* Multi-slice Thumbnail strip at bottom */}
              {images.length > 1 && (
                <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-850 flex items-center justify-center gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                        currentImageIndex === idx
                          ? 'border-primary-500 ring-2 ring-primary-500/30 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: RADIOLOGY REPORT & FINDINGS */}
            {showMetadataPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-4 shrink-0 font-sans text-xs"
              >
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-2">
                    <FileText size={16} className="text-primary-400" />
                    Radiology Examination Report
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Report ID: RAD-{scan.id.toUpperCase()}</p>
                </div>

                {/* Clinical Indication */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Clinical Indication / Reason
                  </span>
                  <p className="text-slate-200 leading-relaxed">{scan.clinicalReason}</p>
                </div>

                {/* Radiologist Findings */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider block">
                    Detailed Findings
                  </span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">{scan.findings}</p>
                </div>

                {/* Radiologist Impression */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    Final Diagnostic Impression
                  </span>
                  <p className="text-emerald-200 font-medium leading-relaxed whitespace-pre-line">
                    {scan.impression}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Modality:</span>
                    <strong className="text-slate-200">{scan.scanType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Anatomical Target:</span>
                    <strong className="text-slate-200">{scan.bodyPart}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ordering Physician:</span>
                    <strong className="text-slate-200">{scan.orderingDoctor}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interpreting Radiologist:</span>
                    <strong className="text-slate-200">{scan.radiologist}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Diagnostic Center:</span>
                    <strong className="text-slate-200">{scan.facility}</strong>
                  </div>
                </div>

                {/* Notes */}
                {scan.notes && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300">
                    <strong className="text-slate-200 block mb-0.5">Technologist Notes:</strong>
                    {scan.notes}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
