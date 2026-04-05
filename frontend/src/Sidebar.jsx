export default function Sidebar({ tab, setTab }) {
  const sections = [
    {
      title: "Overview",
      tabs: [
        { id: "dashboard", label: "Dashboard Hub" },
        { id: "users", label: "Registered Users" },
      ]
    },
    {
      title: "User Placements",
      tabs: [
        { id: "pending", label: "Pending Approvals" },
        { id: "approved", label: "Live Placements" },
        { id: "rejected", label: "Rejected Placements" },
      ]
    },
    {
       title: "Service Providers",
       tabs: [
        { id: "pending-service-providers", label: "Pending Signups" },
        { id: "approved-service-providers", label: "Approved Partners" },
        { id: "rejected-service-providers", label: "Rejected Profiles" },
       ]
    },
    {
       title: "Provider Services",
       tabs: [
        { id: "pending-provider's-services", label: "Pending Services" },
        { id: "approved-provider's-services", label: "Active Services" },
        { id: "rejected-provider's-services", label: "Rejected Services" },
       ]
    }
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-100 min-h-screen p-6 shadow-sm z-10 shrink-0 select-none hidden lg:block">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg font-extrabold text-lg">
          A
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Admin Control</h2>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="uppercase tracking-wider text-xs font-bold text-gray-400 mb-3 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full text-left flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 block ${
                    tab === t.id 
                      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-3 shrink-0 transition-colors ${tab === t.id ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-gray-200'}`}></span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}