"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Share2, 
  AlertTriangle,
  Lightbulb,
  AudioWaveform,
  Activity,
  Fingerprint
} from "lucide-react"

export interface AnalysisResult {
  isFake: boolean
  accuracy: number
  confidence: number
  details: {
    pattern: string
    consistency: string
    signature: string
  }
}

interface ResultDisplayProps {
  result: AnalysisResult
  onReset: () => void
}

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const { isFake, accuracy, details } = result
  const iconRef = useRef<HTMLDivElement>(null)

  // Auto scroll to icon when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" })
      setTimeout(() => {
        iconRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 50)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleShare = async () => {
    const shareText = isFake
      ? `DeepVoice Shield ตรวจพบเสียง AI ปลอม! (ความแม่นยำ ${accuracy}%) - ระวังมิจฉาชีพ!`
      : `DeepVoice Shield ตรวจสอบแล้ว: เสียงนี้น่าจะเป็นเสียงจริง (ความแม่นยำ ${accuracy}%)`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "DeepVoice Shield",
          text: shareText,
          url: window.location.href,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      alert("คัดลอกข้อความไปยังคลิปบอร์ดแล้ว")
    }
  }

  return (
    <section className="px-4 max-w-2xl mx-auto py-8 animate-fade-in-up">
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50">
        {/* Result Icon */}
        <div ref={iconRef} className="flex justify-center mb-6">
          <div
            className={cn(
              "w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center",
              isFake
                ? "bg-destructive/20 animate-danger-pulse"
                : "bg-success/20 animate-success-glow"
            )}
          >
            {isFake ? (
              <ShieldAlert className="w-16 h-16 md:w-20 md:h-20 text-destructive" strokeWidth={1.5} />
            ) : (
              <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-success" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Result Title */}
        <h2
          className={cn(
            "text-2xl md:text-3xl font-bold text-center mb-4",
            isFake ? "text-destructive" : "text-success"
          )}
        >
          {isFake ? "ตรวจพบเสียง AI ปลอม!" : "เสียงนี้น่าจะเป็นเสียงจริง"}
        </h2>

        {/* Accuracy Badge */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              "px-6 py-3 rounded-full text-xl font-bold text-white",
              isFake ? "bg-destructive" : "bg-success"
            )}
          >
            ความแม่นยำ: {accuracy}%
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-6">
          <p className="text-muted-foreground mb-2 text-sm">ระดับความเชื่อมั่น</p>
          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isFake ? "bg-destructive" : "bg-success"
              )}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-secondary/50 rounded-xl p-5 mb-6 border border-border/30">
          <h3 className="font-semibold mb-4 text-lg">รายละเอียดการวิเคราะห์</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <AudioWaveform className="w-4 h-4" />
                รูปแบบเสียง
              </span>
              <span className="font-medium">{details.pattern}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                ความสม่ำเสมอ
              </span>
              <span className="font-medium">{details.consistency}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Fingerprint className="w-4 h-4" />
                ลักษณะพิเศษ
              </span>
              <span className="font-medium">{details.signature}</span>
            </div>
          </div>
        </div>

        {/* Advice/Warning Box */}
        {isFake ? (
          <div className="bg-destructive/10 border-2 border-destructive/50 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-destructive text-lg mb-2">
                  อย่าโอนเงิน! อย่าให้ข้อมูลส่วนตัว!
                </p>
                <p className="text-foreground leading-relaxed">
                  หากได้รับโทรศัพท์ต้องสงสัย ให้วางสาย แล้วโทรกลับหาคนนั้นโดยตรงด้วยหมายเลขที่คุณรู้จัก
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-primary/10 border-2 border-primary/50 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary mb-2">คำแนะนำ</p>
                <p className="text-foreground leading-relaxed">
                  แม้ผลออกมาว่าเป็นเสียงจริง ควรยืนยันตัวตนของผู้โทรด้วยวิธีอื่นเสมอ 
                  เช่น โทรกลับหมายเลขที่รู้จัก หรือถามคำถามที่มีเฉพาะคนนั้นรู้
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1 py-6 text-lg min-h-[60px] border-2"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            ตรวจสอบเสียงใหม่
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 py-6 text-lg min-h-[60px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            size="lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            แชร์ผลให้คนอื่น
          </Button>
        </div>
      </div>
    </section>
  )
}
