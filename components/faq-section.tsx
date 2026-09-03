"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  HelpCircle, 
  Smartphone, 
  Lock, 
  Target, 
  LifeBuoy 
} from "lucide-react"

const faqItems = [
  {
    id: "how-it-works",
    icon: HelpCircle,
    question: "DeepVoice Shield ทำงานอย่างไร?",
    answer:
      "DeepVoice Shield ใช้เทคโนโลยี AI ในการวิเคราะห์คุณลักษณะของเสียงคนพูด เช่น รูปแบบคลื่นเสียง ความถี่ และความสม่ำเสมอ เพื่อตรวจจับสัญญาณที่บ่งบอกว่าเสียงพูดถูกสร้างโดย AI หรือเป็นเสียงจริงจากมนุษย์ หมายเหตุ: ระบบออกแบบมาเพื่อตรวจจับเสียงคนพูดเท่านั้น ไม่รองรับการตรวจจับเสียงเพลงหรือเสียงอื่นๆ",
  },
  {
    id: "mobile",
    icon: Smartphone,
    question: "ใช้ได้กับโทรศัพท์มือถือไหม?",
    answer:
      "ได้! DeepVoice Shield ออกแบบมาให้ใช้งานได้ดีบนมือถือทั้ง iPhone และ Android คุณสามารถอัพโหลดไฟล์เสียงจากเครื่อง หรืออัดเสียงสดผ่านไมโครโฟนของมือถือได้เลย",
  },
  {
    id: "privacy",
    icon: Lock,
    question: "ไฟล์เสียงของฉันถูกเก็บไหม?",
    answer:
      "ไม่เก็บ! การวิเคราะห์ทั้งหมดทำบนอุปกรณ์ของคุณเท่านั้น ไฟล์เสียงจะไม่ถูกส่งไปยังเซิร์ฟเวอร์ใดๆ และจะถูกลบออกจากหน่วยความจำทันทีหลังวิเคราะห์เสร็จ ข้อมูลของคุณปลอดภัย 100%",
  },
  {
    id: "accuracy",
    icon: Target,
    question: "ผลที่ได้แม่นยำแค่ไหน?",
    answer:
      "ระบบของเรามีความแม่นยำประมาณ 91.07% ขึ้นอยู่กับคุณภาพของเสียง อย่างไรก็ตาม ผลการวิเคราะห์ควรใช้เป็นข้อมูลประกอบการตัดสินใจเท่านั้น ควรยืนยันตัวตนด้วยวิธีอื่นเสมอ เช่น โทรกลับหาคนนั้นโดยตรง",
  },
  {
    id: "scammed",
    icon: LifeBuoy,
    question: "ถูกโกงแล้วทำยังไง?",
    answer:
      "หากคุณตกเป็นเหยื่อมิจฉาชีพ ให้ดำเนินการดังนี้: 1) แจ้งความที่สถานีตำรวจใกล้บ้าน 2) โทรแจ้ง DSI ที่เบอร์ 1202 3) ติดต่อธนาคารเพื่อระงับบัญชีหากมีการโอนเงิน 4) เก็บหลักฐานทั้งหมดไว้ เช่น บันทึกการสนทนา ใบโอนเงิน",
  },
]

export function FAQSection() {
  return (
    <section className="px-4 max-w-2xl mx-auto py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        คำถามที่พบบ่อย
      </h2>
      
      <Accordion type="single" collapsible className="space-y-3">
        {faqItems.map((item) => {
          const Icon = item.icon
          return (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="bg-card rounded-xl border border-border/50 overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-5 text-lg text-left hover:no-underline hover:bg-secondary/30 min-h-[60px] gap-3">
                <span className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 text-muted-foreground leading-relaxed">
                <div className="pl-8">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </section>
  )
}
