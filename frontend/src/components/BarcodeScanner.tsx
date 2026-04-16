import { useEffect, useRef } from 'react';
import { useScanner } from '../hooks/useScanner';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScanned: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanned, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scanning, scannedCode, startScanner, stopScanner } = useScanner();

  useEffect(() => {
    if (videoRef.current) {
      startScanner(videoRef.current);
    }
    return () => stopScanner();
  }, []);

  useEffect(() => {
    if (scannedCode) {
      onScanned(scannedCode);
    }
  }, [scannedCode, onScanned]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Camera size={20} />
          <span className="font-medium">Escanear código de barras</span>
        </div>
        <button
          onClick={() => { stopScanner(); onClose(); }}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        {/* Scan frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-40 border-2 border-white/80 rounded-lg relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
          </div>
        </div>

        {scanning && (
          <p className="absolute bottom-8 left-0 right-0 text-center text-white text-sm">
            Apunta al código de barras del producto
          </p>
        )}
      </div>
    </div>
  );
}
