'use client';

interface Notification {
  id: string;
  title: string;
  date: string;
}

export default function AccountNotifications() {
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Digitalk has changed status of R4468-9 App Wear US to LIVE',
      date: 'Thu Aug 07 2025'
    },
    {
      id: '2',
      title: 'Digitalk has changed status of T14239-Educational Ad to LIVE',
      date: 'Thu Aug 07 2025'
    },
    {
      id: '3',
      title: 'Digitalk has changed status of B5512-JOFY to LIVE',
      date: 'Thu Aug 07 2025'
    },
    {
      id: '4',
      title: 'Digitalk has changed status of P15614-App swap BWIN US to LIVE',
      date: 'Thu Aug 07 2025'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Account Notifications</h2>
        <button className="text-sm text-indigo-400 hover:text-indigo-300">View all</button>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="border-l-4 border-indigo-500 pl-4 py-2">
            <div className="text-sm">{notification.title}</div>
            <div className="text-xs text-gray-400 mt-1">{notification.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
