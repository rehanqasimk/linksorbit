import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface AssignSiteIdFormProps {
  publisherId: string;
  currentSiteId?: string;
  onSuccess?: () => void;
}

export default function AssignSiteIdForm({ 
  publisherId, 
  currentSiteId = '',
  onSuccess 
}: AssignSiteIdFormProps) {
  const [siteId, setSiteId] = useState(currentSiteId);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/publishers/${publisherId}/site-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: siteId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast.success('Site ID successfully assigned');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="siteId" className="block text-sm font-medium text-gray-700">
          Site ID
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="siteId"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter site ID from third-party portal"
            required
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Assigning a site ID will automatically approve this publisher's account.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Assigning...' : 'Assign Site ID'}
        </button>
      </div>
    </form>
  );
}
