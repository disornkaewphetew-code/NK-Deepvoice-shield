"use client"

import { Shield, Lock } from "lucide-react"

export function Footer() {
  return (
    <footer className="px-4 py-12 mt-8 border-t border-border/50">
      <div className="max-w-2xl mx-auto">
        {/* Privacy Notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
          <Lock className="w-4 h-4" />
          <p>DeepVoice Shield ไม่เก็บข้อมูลเสียงของคุณ วิเคราะห์บนอุปกรณ์ของคุณเท่านั้น</p>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">DeepVoice Shield</span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground/70 text-center">
          พัฒนาโดยนักเรียนโรงเรียนมัธยมวัดหนองแขม
        </p>
      </div>
    </footer>
  )
}
