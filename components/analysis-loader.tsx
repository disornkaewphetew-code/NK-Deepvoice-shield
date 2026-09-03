"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Shield, AudioWaveform, BarChart3, CheckCircle } from "lucide-react"

const statusMessages = [
  { icon: AudioWaveform, text: "กำลังตรวจสอบคุณลักษณะเสียง..." },
  { icon: BarChart3, text: "AI กำลังประมวลผล..." },
  { icon: BarChart3, text: "คำนวณความน่าเชื่อถือ..." },
  { icon: CheckCircle, text: "เกือบเสร็จแล้ว..." },
]

interface AnalysisLoaderProps {
  onComplete: () => void
}

export function AnalysisLoader({ onComplete }: AnalysisLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % statusMessages.length)
    }, 1000)

    const completeTimeout = setTimeout(() => {
      onComplete()
    }, 5000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  const CurrentIcon = statusMessages[messageIndex].icon

  return (
    <section className="px-4 max-w-md mx-auto py-12 animate-fade-in-up">
      <div className="bg-card rounded-2xl p-8 md:p-10 text-center border border-border/50">
        {/* Animated Shield */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse-glow rounded-full">
            <Shield className="w-20 h-20 md:w-24 md:h-24 text-primary fill-primary/20" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin-slow" />
          <div 
            className="absolute inset-3 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow" 
            style={{ animationDirection: "reverse", animationDuration: "2s" }} 
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
        </div>

        {/* Status Message */}
        <div className="flex items-center justify-center gap-3">
          <CurrentIcon className="w-5 h-5 text-primary" />
          <p className="text-lg font-medium">{statusMessages[messageIndex].text}</p>
        </div>
      </div>
    </section>
  )
}
