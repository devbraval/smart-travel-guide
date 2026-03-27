export default function Filter({ onChange }) {
  return (
    <div className="flex justify-end mb-6 px-4 sm:px-8 md:px-12 mt-8">
      <div className="relative inline-block w-full sm:w-56">
        <select 
          onChange={(e) => onChange(e.target.value)}
          className="block w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 cursor-pointer font-medium text-sm sm:text-base hover:border-gray-300 hover:shadow-md"
        >
          <option value="">Sort By</option>
          <option value="rating">⭐ Rating (High → Low)</option>
          <option value="name">🔤 Name (A → Z)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg className="fill-current h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
        </div>
      </div>
    </div>
  );
}