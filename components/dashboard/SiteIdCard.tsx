import { useSession } from "next-auth/react";

export default function SiteIdCard() {
  const { data: session } = useSession();
  
  if (!session?.user?.siteId) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Your site ID will be available once your account is approved.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900">Your Site ID</h3>
      <div className="mt-3 flex items-center">
        <code className="bg-gray-100 text-sm text-gray-800 p-2 rounded">
          {session.user.siteId}
        </code>
        <button
          onClick={() => navigator.clipboard.writeText(session.user.siteId || "")}
          className="ml-2 p-2 text-gray-500 hover:text-gray-700"
          title="Copy to clipboard"
        >
          📋
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Use this site ID when integrating our API into your website.
      </p>
    </div>
  );
}
