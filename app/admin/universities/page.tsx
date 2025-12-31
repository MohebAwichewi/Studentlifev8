import { getUniversities, addUniversity, deleteUniversity } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function UniversityManagement() {
  const universities = await getUniversities()

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <a href="/admin/dashboard" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </a>
          <h1 className="text-xl font-bold text-gray-900">University Management (ADM-04)</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- LEFT: ADD NEW UNIVERSITY FORM --- */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Campus</h2>
            <form action={addUniversity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">University Name</label>
                <input name="name" required placeholder="e.g. ESPRIT" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Region / City</label>
                <input name="region" required placeholder="e.g. Ariana" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-black outline-none" />
              </div>
              <button className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all text-sm">
                <i className="fa-solid fa-plus mr-2"></i> Add to Database
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT: LIST OF UNIVERSITIES --- */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {universities.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">No universities found. Add one!</td></tr>
                ) : (
                  universities.map((uni: any) => (
                    <tr key={uni.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">#{uni.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{uni.name}</td>
                      <td className="px-6 py-4 text-gray-600">{uni.region}</td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteUniversity.bind(null, uni.id)}>
                          <button className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}