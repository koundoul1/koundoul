const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-14 h-14 bg-gradient-to-br from-kprimary to-ksecondary rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-kprimary/30">
      <span className="text-white font-black text-2xl">K</span>
    </div>
    <p className="text-white/40 text-sm font-medium">Chargement...</p>
  </div>
)

export default PageLoader
