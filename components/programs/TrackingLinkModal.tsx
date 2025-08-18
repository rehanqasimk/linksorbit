import { useState } from 'react';

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

  if (!isOpen) return null;

  const displayLink = showFullLink 
    ? program.trackinglink 
    : program.trackinglink.length > 60 
      ? `${program.trackinglink.substring(0, 60)}...` 
      : program.trackinglink;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tracking Link for {program.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Use this tracking link to promote this program:</p>
          <div className="bg-gray-100 p-3 rounded-lg break-all relative">
            <p className="text-sm font-mono pr-10">{displayLink}</p>
            <button
              className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => {
                navigator.clipboard.writeText(program.trackinglink);
                onCopyLink();
              }}
            >
              Copy
            </button>
          </div>
          {program.trackinglink.length > 60 && (
            <button 
              className="text-blue-600 hover:text-blue-800 text-xs mt-1"
              onClick={() => setShowFullLink(!showFullLink)}
            >
              {showFullLink ? 'Show less' : 'Show full link'}
            </button>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">How to use:</h4>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li>Use this link in your promotional content</li>
            <li>The link will track sales and leads attributed to your account</li>
            {program.deeplink && (
              <li>This program supports deep linking - you can append product URLs</li>
            )}
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
          >
            Close
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(program.trackinglink);
              onCopyLink();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Copy Tracking Link
          </button>
        </div>
      </div>
    </div>
  );
}
