import { useEffect, useState } from "react";

export function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShow(true);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShow(false);
      }, 10000);
    };

    const handleInstalled = () => {
      setShow(false);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setShow(false);
  };

  if (!show || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-white p-4 text-gray-900 shadow-xl ring-1 ring-gray-200 lg:hidden">
      <div>
        <p className="font-semibold">Install Nagarik</p>
        <p className="text-sm text-gray-600">
          Quick access to civic services.
        </p>
      </div>

      <button
        onClick={installApp}
        className="shrink-0 rounded-lg bg-green-700 px-4 py-2 font-medium text-white"
      >
        Install
      </button>
    </div>
  );
}

export default InstallApp;
