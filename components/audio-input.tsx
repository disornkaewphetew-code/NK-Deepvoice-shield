"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  Upload, 
  Mic, 
  FolderOpen, 
  FileAudio, 
  Search,
  Square,
  Play,
  Pause,
  X,
  Info
} from "lucide-react"

interface AudioInputProps {
  onAnalyze: (audioData: Blob) => void
  isAnalyzing: boolean
}

export function AudioInput({ onAnalyze, isAnalyzing }: AudioInputProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(24).fill(8))
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [audioUrl])

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(URL.createObjectURL(file))
      setRecordedBlob(null)
      setIsPlaying(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const clearFile = () => {
    setAudioFile(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const visualize = useCallback(() => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const levels = []
    const step = Math.floor(dataArray.length / 24)
    for (let i = 0; i < 24; i++) {
      const value = dataArray[i * step]
      levels.push(Math.max(8, (value / 255) * 100))
    }
    setAudioLevels(levels)
    
    animationFrameRef.current = requestAnimationFrame(visualize)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      visualize()
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setRecordedBlob(blob)
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        setAudioLevels(Array(24).fill(8))
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      setAudioFile(null)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch {
      alert("ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตการใช้งานไมโครโฟน")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleAnalyze = () => {
    if (activeTab === "upload" && audioFile) {
      onAnalyze(audioFile)
    } else if (activeTab === "record" && recordedBlob) {
      onAnalyze(recordedBlob)
    }
  }

  const canAnalyze = (activeTab === "upload" && audioFile) || (activeTab === "record" && recordedBlob)

  return (
    <section className="px-4 max-w-2xl mx-auto animate-fade-in-up">
      {/* Tab Selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("upload")}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-lg font-medium transition-all min-h-[60px] border-2",
            activeTab === "upload"
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
              : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-card/80"
          )}
        >
          <Upload className="w-5 h-5" />
          <span>อัพโหลดไฟล์</span>
        </button>
        <button
          onClick={() => setActiveTab("record")}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-lg font-medium transition-all min-h-[60px] border-2",
            activeTab === "record"
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
              : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-card/80"
          )}
        >
          <Mic className="w-5 h-5" />
          <span>อัดเสียงสด</span>
        </button>
      </div>

      {/* Upload Panel */}
      {activeTab === "upload" && (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50">
          {/* Drop Zone */}
          {!audioFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                isDragOver 
                  ? "border-primary bg-primary/10" 
                  : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">ลากไฟล์เสียงมาวางที่นี่</p>
              <p className="text-muted-foreground mb-4">หรือกดเพื่อเลือกไฟล์</p>
              <p className="text-sm text-muted-foreground/70">รองรับ MP3, WAV, M4A, OGG (ไม่เกิน 20MB)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <FileAudio className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{audioFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(audioFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive/30 transition-colors shrink-0"
                    aria-label="ลบไฟล์"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="bg-secondary/30 rounded-xl p-4">
                  <audio 
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayback}
                      className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                      aria-label={isPlaying ? "หยุด" : "เล่น"}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 h-8">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/40 rounded-full"
                            style={{ height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Change File Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 text-primary hover:text-primary/80 transition-colors text-center"
              >
                เปลี่ยนไฟล์
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full mt-6 py-6 text-xl min-h-[60px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:shadow-none"
            size="lg"
          >
            <Search className="w-6 h-6 mr-2" />
            เริ่มวิเคราะห์เสียง
          </Button>

          {/* Guidelines */}
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Info className="w-4 h-4" />
              <span className="font-medium text-sm">คำแนะนำเพื่อประสิทธิภาพสูงสุด</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>ความยาวไฟล์ขั้นต่ำ 5 วินาที</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>แนะนำให้อัดเสียงพูดต่อเนื่องและชัดเจน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>หลีกเลี่ยงเสียงรบกวน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>รองรับไฟล์เสียงขนาดไม่เกิน 20 MB</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Record Panel */}
      {activeTab === "record" && (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50">
          {/* Record Button */}
          <div className="flex flex-col items-center mb-8">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all",
                isRecording
                  ? "bg-destructive animate-recording-pulse"
                  : recordedBlob
                    ? "bg-success hover:bg-success/90"
                    : "bg-destructive/80 hover:bg-destructive"
              )}
              aria-label={isRecording ? "หยุดอัด" : "เริ่มอัด"}
            >
              {isRecording ? (
                <Square className="w-10 h-10 text-white fill-white" />
              ) : recordedBlob ? (
                <Mic className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
            
            <p className="mt-5 text-lg text-center font-medium">
              {isRecording 
                ? "กำลังอัด���สียง..."
                : recordedBlob
                  ? "อัดเสร็จแล้ว พร้อมวิเคราะห์"
                  : "กดปุ่มเพื่อเริ่มอัดเสียง"
              }
            </p>
            
            {isRecording && (
              <p className="text-sm text-muted-foreground mt-1">กดอีกครั้งเพื่อหยุด</p>
            )}
            
            {/* Timer */}
            <p className="text-4xl font-mono mt-4 tabular-nums">{formatTime(recordingTime)}</p>
          </div>

          {/* Audio Level Visualizer */}
          <div className="flex items-end justify-center gap-1 h-16 mb-6 px-4">
            {audioLevels.map((level, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 rounded-full transition-all duration-75",
                  isRecording ? "bg-destructive" : "bg-primary/40"
                )}
                style={{ height: `${level}%` }}
              />
            ))}
          </div>

          {/* Playback */}
          {!isRecording && audioUrl && (
            <div className="bg-secondary/30 rounded-xl p-4 mb-6">
              <audio 
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="w-14 h-14 rounded-full bg-success flex items-center justify-center text-white hover:bg-success/90 transition-colors shrink-0"
                  aria-label={isPlaying ? "หยุด" : "เล่น"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>
                <div className="flex-1">
                  <p className="font-medium">เสียงที่บันทึก</p>
                  <p className="text-sm text-muted-foreground">ระยะเวลา {formatTime(recordingTime)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing || isRecording}
            className="w-full py-6 text-xl min-h-[60px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:shadow-none"
            size="lg"
          >
            <Search className="w-6 h-6 mr-2" />
            เริ่มวิเคราะห์เสียง
          </Button>

          {/* Guidelines */}
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Info className="w-4 h-4" />
              <span className="font-medium text-sm">คำแนะนำเพื่อประสิทธิภาพสูงสุด</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>อัดเสียงพูดอย่างน้อย 5 วินาที</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>แนะนำให้พูดต่อเนื่องและชัดเจน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>หลีกเลี่ยงเสียงรบกวน</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
