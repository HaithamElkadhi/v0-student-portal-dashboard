"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function Page() {
  const router = useRouter()

  const handleStartClick = () => {
    router.push("/verification")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <img 
                  src="/Jeexpert Logo base.png" 
                  alt="JEEXPERT Logo" 
                  className="h-20 w-auto drop-shadow-lg"
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-3 tracking-tight">JEEXPERT</h1>
            <p className="text-xl text-muted-foreground font-medium">Student Portal</p>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg max-w-3xl mx-auto">
              <div className="text-center space-y-5">
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                  Your central hub to track your admission, visa, scholarship, and integration progress, all in one secure space.
                </h2>
                
                <p className="text-lg md:text-xl text-muted-foreground font-semibold">
                  Stay informed at every step of your journey
                </p>
                
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  With this portal, you have real-time access to every stage of your application, from the first university submission to your arrival in Italy or France. No more confusion, no more waiting for updates, everything is transparent and organized for you.
                </p>
              </div>
            </div>
          </div>

          {/* Start Now Button */}
          <div className="flex justify-center">
            <button
              onClick={handleStartClick}
              className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 hover:scale-105"
            >
              Start now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
