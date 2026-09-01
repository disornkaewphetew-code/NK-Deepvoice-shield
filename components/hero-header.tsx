"use client"

import { Shield, Upload, Search, FileCheck, ArrowRight } from "lucide-react"

export function HeroHeader() {
  return (
    <header className="text-center py-12 md:py-16 px-4">
      {/* Shield Logo */}
      <div className="flex justify-center mb-8">
        <div className="relative animate-shield-pulse">
          <Shield className="w-24 h-24 md:w-28 md:h-28 text-primary fill-primary/20" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/30" />
          </div>
        </div>
      </div>
      
      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
        DeepVoice Shield
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl md:text-2xl text-primary mb-6 font-medium">
        ตรวจจับเสียง AI ปลอมในภาษาไทย
      </p>
      
      {/* Description */}
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed text-pretty">
        ตรวจสอบว่าเสียงที่คุณได้ยินเป็น AI ปลอมหรือเปล่า
        <br className="hidden md:block" />
        ใช้ง่าย ฟรี ไม่ต้องสมัครสมาชิก
      </p>

      {/* AI Detection Note */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary mb-10">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>AI ตรวจจับเฉพาะเสียงคนพูดเท่านั้น</span>
      </div>
      
      {/* 3-Step Instructions */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 bg-card/50 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">ขั้นตอนที่ 1</p>
            <p className="text-lg font-medium">เลือกเสียง</p>
          </div>
        </div>
        
        <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground shrink-0" />
        <div className="md:hidden w-8 h-[2px] bg-border rotate-90" />
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">ขั้นตอนที่ 2</p>
            <p className="text-lg font-medium">วิเคราะห์</p>
          </div>
        </div>
        
        <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground shrink-0" />
        <div className="md:hidden w-8 h-[2px] bg-border rotate-90" />
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">ขั้นตอนที่ 3</p>
            <p className="text-lg font-medium">ดูผล</p>
          </div>
        </div>
      </div>
    </header>
  )
}
