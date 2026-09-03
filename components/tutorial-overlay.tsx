"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UploadCloud, ScanSearch, ShieldCheck, X, ArrowRight, ArrowLeft } from "lucide-react"

const STORAGE_KEY = "dvs-tutorial-seen"

const steps = [
  {
    icon: UploadCloud,
    number: "1",
    title: "เลือกหรืออัดเสียงพูด",
    description:
      "อัปโหลดไฟล์เสียงที่ต้องการตรวจสอบ หรือกดอัดเสียงพูดโดยตรง (ความยาวอย่างน้อย 5 วินาที พูดต่อเนื่องและชัดเจน)",
  },
  {
    icon: ScanSearch,
    number: "2",
    title: "กดเริ่มวิเคราะห์เสียง",
    description:
      "เมื่อได้ไฟล์เสียงแล้ว กดปุ่ม “เริ่มวิเคราะห์เสียง” ระบบ AI จะประมวลผลลักษณะของเสียงพูดให้อัตโนมัติ",
  },
  {
    icon: ShieldCheck,
    number: "3",
    title: "ดูผลการตรวจจับ",
    description:
      "รอสักครู่ ระบบจะแสดงผลว่าเสียงนั้นเป็นเสียงคนจริง หรือเป็นเสียง AI ปลอม พร้อมระดับความมั่นใจของผลลัพธ์",
  },
]

export function TutorialOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  if (!isOpen) return null

  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="ปิดคำแนะนำการใช้งาน"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header label */}
        <div className="pt-8 px-6 text-center">
          <p className="text-sm text-primary font-medium">วิธีการใช้งาน</p>
        </div>

        {/* Icon */}
        <div className="flex justify-center pt-6">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/30">
            <Icon className="w-11 h-11 text-primary" />
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-lg">
              {step.number}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-2 text-center min-h-[140px]">
          <h2 id="tutorial-title" className="text-2xl font-bold text-foreground mb-3 text-balance">
            {step.title}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed text-pretty">
            {step.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              aria-label={`ไปยังขั้นตอนที่ ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === currentStep ? "w-8 bg-primary" : "w-2 bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 px-6 pb-6">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="flex-1 py-5 min-h-[52px] gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 py-5 min-h-[52px] gap-2 bg-primary hover:bg-primary/90"
          >
            {isLastStep ? (
              "เริ่มใช้งาน"
            ) : (
              <>
                ถัดไป
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip */}
        {!isLastStep && (
          <div className="pb-5 text-center">
            <button
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ข้ามคำแนะนำ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
