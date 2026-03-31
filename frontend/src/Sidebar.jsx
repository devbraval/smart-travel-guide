export default function Sidebar({ tab, setTab }) {
  const tabs = ["pending", "approved", "rejected","users","dashboard"];

  return (
    <div className="w-60 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl mb-6 font-bold">Admin Panel</h2>

      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`block w-full text-left px-3 py-2 mb-2 rounded transition ${
            tab === t ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  );
}