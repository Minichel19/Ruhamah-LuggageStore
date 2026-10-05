'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Props = {
  onClose: () => void;
  onScan: (booking: any) => void;
};

export default function QRScanner({ onClose, onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (!mounted || !scanning) return;
            setScanning(false);
            await scanner.stop();
            await lookupBooking(decodedText);
          },
          () => {}
        );
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Could not start camera');
      }
    }

    async function lookupBooking(sessionId: string) {
      try {
        const res = await fetch(`/api/bookings?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data.booking) {
          onScan(data.booking);
        } else {
          setError('No booking found for this QR code');
        }
      } catch {
        setError('Failed to look up booking');
      }
    }

    startScanner();

    return () => {
      mounted = false;
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Scan Customer QR Code</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        <div id="qr-reader" className="w-full rounded overflow-hidden bg-black"></div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Point the camera at the customer&apos;s QR code
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 text-gray-800 py-3 rounded font-semibold hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}