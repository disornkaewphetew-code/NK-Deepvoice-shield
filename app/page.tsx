"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { HeroHeader } from "@/components/hero-header"
import { AudioInput } from "@/components/audio-input"
import { AnalysisLoader } from "@/components/analysis-loader"
import { ResultDisplay, type AnalysisResult } from "@/components/result-display"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { useEdgeImpulseClassifier } from "@/hooks/use-edge-impulse-classifier"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

type AppState = "input" | "analyzing" | "result"

export default function DeepVoiceShield() {
  const [appState, setAppState] = useState<AppState>("input")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  
  const { 
    initialize, 
    classify, 
    retry,
    isInitialized, 
    isLoading: isClassifierLoading,
    error: classifierError,
    loadingProgress
  } = useEdgeImpulseClassifier()

  // Initialize classifier on mount (only once)
  useEffect(() => {
    if (!isInitialized && !isClassifierLoading && !classifierError) {
      initialize()
    }
  }, [isInitialized, isClassifierLoading, classifierError, initialize])

  const handleAnalyze = useCallback(async (audioBlob: Blob) => {
    setPendingAudio(audioBlob)
    setAppState("analyzing")
  }, [])

  const handleAnalysisComplete = useCallback(async () => {
    if (!pendingAudio) {
      setAppState("input")
      return
    }

    try {
      // Use the Edge Impulse classifier
      const classificationResult = await classify(pendingAudio)
      
      const analysisResult: AnalysisResult = {
        isFake: classificationResult.isFake,
        accuracy: classificationResult.accuracy,
        confidence: classificationResult.confidence,
        details: classificationResult.isFake
          ? {
              pattern: "ผิดปกติ",
              consistency: `คะแนน AI: ${(classificationResult.details.fake_score * 100).toFixed(1)}%`,
              signature: "พบสัญญาณของ AI สังเคราะห์เสียง",
            }
          : {
              pattern: "เป็นธรรมชาติ",
              consistency: `คะแนนเสียงจริง: ${(classificationResult.details.real_score * 100).toFixed(1)}%`,
              signature: "ไม่พบสัญญาณ AI",
            },
      }
      
      setResult(analysisResult)
      setAppState("result")
      
      // Scroll to top first, then to result icon area
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" })
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 50)
      }, 100)
    } catch (err) {
      console.error("[v0] Analysis failed:", err)
      // Fallback to error state
      setResult({
        isFake: false,
        accuracy: 0,
        confidence: 0,
        details: {
          pattern: "เกิดข้อผิดพลาด",
          consistency: "ไม่สามารถวิเคราะห์ได้",
          signature: err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง",
        },
      })
      setAppState("result")
      
      // Scroll to top first, then to result icon area
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" })
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 50)
      }, 100)
    }
  }, [pendingAudio, classify])

  const handleReset = useCallback(() => {
    setAppState("input")
    setResult(null)
    setPendingAudio(null)
  }, [])

  return (
    <main className="min-h-screen">
      {/* First-visit tutorial */}
      <TutorialOverlay />

      {/* Hero Header - Always visible */}
      <HeroHeader />

      {/* Classifier Error with Retry Button */}
      {classifierError && (
        <div className="px-4 max-w-2xl mx-auto mb-4">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-center">
            <p className="text-sm text-destructive mb-3">{classifierError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retry}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {appState === "input" && (
        <AudioInput 
          onAnalyze={handleAnalyze} 
          isAnalyzing={isClassifierLoading} 
        />
      )}

      {appState === "analyzing" && (
        <AnalysisLoader onComplete={handleAnalysisComplete} />
      )}

      {appState === "result" && result && (
        <div ref={resultRef}>
          <ResultDisplay result={result} onReset={handleReset} />
        </div>
      )}

      {/* AI Status Indicator with Progress */}
      {appState === "input" && (
        <div className="px-4 max-w-2xl mx-auto mt-4">
          <div className="flex flex-col items-center gap-2">
            {/* Loading Progress Bar */}
            {isClassifierLoading && loadingProgress > 0 && (
              <div className="w-full max-w-xs">
                <Progress value={loadingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center mt-1">
                  กำลังโหลด AI... {loadingProgress}%
                </p>
              </div>
            )}
            
            {/* Status Indicator */}
            {!isClassifierLoading && (
              <div className={`flex items-center gap-2 text-sm ${isInitialized ? 'text-success' : 'text-muted-foreground'}`}>
                <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-success' : 'bg-muted-foreground animate-pulse'}`} />
                <span>
                  {isInitialized 
                    ? "AI พร้อมใช้งาน" 
                    : "กำลังเตรียม AI..."
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ - Always visible */}
      <FAQSection />

      {/* Footer - Always visible */}
      <Footer />
    </main>
  )
}
