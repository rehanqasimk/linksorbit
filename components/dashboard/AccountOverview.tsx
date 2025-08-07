'use client';

export default function AccountOverview() {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Account Overview</h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400">Total Programs:</div>
          <div className="text-lg">30,786 Programs</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Approved Programs:</div>
          <div className="text-lg">2,200 Programs</div>
        </div>
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium mb-2">This Month Statistics</h3>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-400">Total Sales:</div>
              <div className="text-lg">$0</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Commission:</div>
              <div className="text-lg">$0</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Rejected Commission:</div>
              <div className="text-lg">$0.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
