export default function StudentCoursesPage() {
  return (
    <main className="overflow-hidden rounded-xl border border-[#BCD6EC] bg-white">
      <iframe
        src="/course-finder/index.html"
        title="JEEXPERT Course Finder"
        className="block h-[calc(100dvh-10.5rem-env(safe-area-inset-bottom))] min-h-80 w-full border-0 md:h-[calc(100dvh-8rem)]"
      />
    </main>
  )
}
