import { useState, useEffect } from 'react';

interface TrackingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: {
    name: string;
    trackinglink: string;
    deeplink?: boolean;
  };
  onCopyLink: () => void;
}

export default function TrackingLinkModal({ 
  isOpen, 
  onClose, 
  program,
  onCopyLink
}: TrackingLinkModalProps) {
  const [showFullLink, setShowFullLink] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(program.trackinglink);
    onCopyLink();
    setCopied(true);
  };

  const displayLink = showFullLink 
    ? program.trackinglink 
    : program.trackinglink.length > 60 
      ? `${program.trackinglink.substring(0, 60)}...` 
      : program.trackinglink;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-900 dark:text-white text-lg font-semibold">Tracking Link for {program.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Use this tracking link to promote this program:</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg break-all relative">
            <p className="text-gray-600 dark:text-gray-300 text-sm font-mono pr-16">{displayLink}</p>
            <button
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-sm font-medium px-3 py-1 rounded-md transition-colors"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? (
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Copy</span>
              )}
            </button>
          </div>
          {program.trackinglink.length > 60 && (
            <button 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs mt-1"
              onClick={() => setShowFullLink(!showFullLink)}
            >
              {showFullLink ? 'Show less' : 'Show full link'}
            </button>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-gray-900 dark:text-white text-sm font-semibold mb-2">How to use:</h4>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>Use this link in your promotional content.</li>
            <li>The link will track sales and leads attributed to your account.</li>
            {program.deeplink && (
              <li>This program supports deep linking - you can append product URLs.</li>
            )}
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            disabled={copied}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:bg-green-600 disabled:cursor-not-allowed"
          >
            {copied ? 'Copied!' : 'Copy Tracking Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
