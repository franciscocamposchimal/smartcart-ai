import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useScanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<any>(null);

  const startScanner = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      videoRef.current = videoElement;
      setScanning(true);

      await reader.decodeFromVideoDevice(
        undefined,
        videoElement,
        (result, err) => {
          if (result) {
            const code = result.getText();
            setScannedCode(code);
            toast.success(`Código escaneado: ${code}`);
            stopScanner();
          }
        },
      );
    } catch (err: any) {
      toast.error('No se pudo acceder a la cámara');
      setScanning(false);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setScanning(false);
  }, []);

  const clearCode = useCallback(() => {
    setScannedCode(null);
  }, []);

  return {
    scanning,
    scannedCode,
    startScanner,
    stopScanner,
    clearCode,
  };
}
