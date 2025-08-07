'use client';

export default function ProgramReport() {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Program Report</h2>
        <div className="flex space-x-4">
          <button className="text-sm bg-gray-700 px-3 py-1 rounded">Export</button>
          <input
            type="search"
            placeholder="Keyword Search"
            className="text-sm bg-gray-700 px-3 py-1 rounded text-white placeholder-gray-400"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400">
              <th className="pb-4">Program</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Clicks</th>
              <th className="pb-4">Sales</th>
              <th className="pb-4">Commission</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="py-2 text-gray-500" colSpan={5}>No data available</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center mt-4 space-x-2">
          <button className="text-gray-400 hover:text-white">«</button>
          <button className="text-gray-400 hover:text-white">‹</button>
          <button className="text-gray-400 hover:text-white">›</button>
          <button className="text-gray-400 hover:text-white">»</button>
          <select className="bg-gray-700 text-sm rounded px-2">
            <option>5</option>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
