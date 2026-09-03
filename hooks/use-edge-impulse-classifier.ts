"use client"

import { useState, useRef, useCallback, useEffect } from "react"

// Edge Impulse model expects audio at 16kHz sample rate
const TARGET_SAMPLE_RATE = 16000

// Window size in seconds (how much audio to classify)
const WINDOW_SIZE_SECONDS = 1

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000
const INIT_TIMEOUT_MS = 15000

interface ClassifierResult {
  label: string
  value: number
}

interface ClassificationResult {
  results: ClassifierResult[]
  anomaly?: number
}

interface EdgeImpulseClassifier {
  init: () => Promise<void>
  getProjectInfo: () => { owner: string; name: string; deploy_version: number }
  classify: (features: number[], debug?: boolean) => ClassificationResult
  getProperties: () => { 
    frequency: number
    input_features_count: number
    model_type: string
  }
}

declare global {
  interface Window {
    Module?: {
      onRuntimeInitialized?: () => void
      init: () => number
      get_project: () => unknown
      run_classifier: (ptr: number, length: number, debug: boolean) => unknown
      get_properties: () => unknown
      _malloc: (size: number) => number
      _free: (ptr: number) => void
      HEAPU8: { buffer: ArrayBuffer }
      emcc_classification_project_t: { prototype: object }
    }
    EdgeImpulseClassifier?: new () => EdgeImpulseClassifier
  }
}

export function useEdgeImpulseClassifier() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projectInfo, setProjectInfo] = useState<{ name: string; version: number } | null>(null)
  const [modelProperties, setModelProperties] = useState<{ frequency: number; inputFeaturesCount: number } | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  
  const classifierRef = useRef<EdgeImpulseClassifier | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const initializingRef = useRef(false)

  // Load a script dynamically with timeout
  const loadScript = useCallback((src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if script already exists and loaded
      const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement
      if (existingScript) {
        // Check if already loaded successfully
        if (existingScript.dataset.loaded === 'true') {
          resolve(true)
          return
        }
        // Remove failed script to retry
        if (existingScript.dataset.loaded === 'false') {
          existingScript.remove()
        }
      }

      const script = document.createElement("script")
      script.src = src
      script.async = true
      
      const timeout = setTimeout(() => {
        script.dataset.loaded = 'false'
        resolve(false)
      }, 10000) // 10 second timeout per script
      
      script.onload = () => {
        clearTimeout(timeout)
        script.dataset.loaded = 'true'
        resolve(true)
      }
      script.onerror = () => {
        clearTimeout(timeout)
        script.dataset.loaded = 'false'
        resolve(false)
      }
      
      document.head.appendChild(script)
    })
  }, [])

  // Load Edge Impulse scripts with progress
  const loadScripts = useCallback(async () => {
    // Check if already loaded
    if (window.EdgeImpulseClassifier) {
      setLoadingProgress(50)
      return true
    }

    setLoadingProgress(10)

    // Load edge-impulse-standalone.js first
    const standaloneLoaded = await loadScript("/edge-impulse-standalone.js")
    if (!standaloneLoaded) {
      console.error("[v0] Failed to load edge-impulse-standalone.js")
      return false
    }

    setLoadingProgress(30)

    // Wait for Module to be ready with timeout
    await new Promise<void>((resolve) => {
      let attempts = 0
      const maxAttempts = 30
      const checkModule = () => {
        attempts++
        if (window.Module || attempts >= maxAttempts) {
          resolve()
        } else {
          setTimeout(checkModule, 100)
        }
      }
      checkModule()
    })

    setLoadingProgress(40)

    // Load run-impulse.js (contains EdgeImpulseClassifier class)
    const runImpulseLoaded = await loadScript("/run-impulse.js")
    if (!runImpulseLoaded) {
      console.error("[v0] Failed to load run-impulse.js")
      return false
    }

    setLoadingProgress(50)
    return true
  }, [loadScript])

  // Initialize classifier with retry logic
  const initializeWithRetry = useCallback(async (attempt: number = 0): Promise<boolean> => {
    try {
      setLoadingProgress(50 + (attempt * 5))

      // Load scripts
      const loaded = await loadScripts()
      if (!loaded) {
        throw new Error("ไม่สามารถโหลดไฟล์ AI ได้")
      }

      setLoadingProgress(60)

      // Wait for EdgeImpulseClassifier to be available with timeout
      await new Promise<void>((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 100 // 10 seconds total
        const startTime = Date.now()

        const checkClassifier = () => {
          attempts++
          const elapsed = Date.now() - startTime
          
          // Update progress
          const progressInPhase = Math.min((elapsed / 8000) * 25, 25)
          setLoadingProgress(60 + progressInPhase)
          
          if (window.EdgeImpulseClassifier) {
            resolve()
          } else if (elapsed >= INIT_TIMEOUT_MS || attempts >= maxAttempts) {
            reject(new Error("หมดเวลารอโมเดล AI"))
          } else {
            setTimeout(checkClassifier, 100)
          }
        }
        checkClassifier()
      })

      setLoadingProgress(85)

      // Create classifier instance
      const classifier = new window.EdgeImpulseClassifier!()
      await classifier.init()
      
      setLoadingProgress(95)
      
      classifierRef.current = classifier
      
      // Get project info
      const info = classifier.getProjectInfo()
      setProjectInfo({
        name: info.name,
        version: info.deploy_version
      })

      // Get model properties (for correct input size)
      const props = classifier.getProperties()
      setModelProperties({
        frequency: props.frequency,
        inputFeaturesCount: props.input_features_count
      })
      
      setLoadingProgress(100)
      console.log("[v0] Edge Impulse classifier initialized:", info)
      
      return true
    } catch (err) {
      console.error(`[v0] Initialize attempt ${attempt + 1} failed:`, err)
      return false
    }
  }, [loadScripts])

  // Main initialize function with automatic retry
  const initialize = useCallback(async () => {
    // Prevent concurrent initialization
    if (initializingRef.current || isInitialized) return
    
    initializingRef.current = true
    setIsLoading(true)
    setError(null)
    setLoadingProgress(0)

    let success = false
    let lastError = ""

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      setRetryCount(attempt)
      
      if (attempt > 0) {
        console.log(`[v0] Retrying initialization (attempt ${attempt + 1}/${MAX_RETRIES})...`)
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
        setLoadingProgress(5)
      }

      success = await initializeWithRetry(attempt)
      
      if (success) {
        break
      }
      
      lastError = `ลองครั้งที่ ${attempt + 1} ไม่สำเร็จ`
    }

    if (success) {
      setIsInitialized(true)
      setError(null)
    } else {
      setError(`ไม่สามารถโหลด AI ได้ กรุณารีเฟรชหน้าเว็บ (ลองแล้ว ${MAX_RETRIES} ครั้ง)`)
      setLoadingProgress(0)
    }

    setIsLoading(false)
    initializingRef.current = false
  }, [isInitialized, initializeWithRetry])

  // Manual retry function
  const retry = useCallback(() => {
    setError(null)
    setIsInitialized(false)
    setLoadingProgress(0)
    initializingRef.current = false
    // Clear cached scripts to force reload
    document.querySelectorAll('script[src*="edge-impulse"], script[src*="run-impulse"]').forEach(s => s.remove())
    delete window.EdgeImpulseClassifier
    delete window.Module
    initialize()
  }, [initialize])

  // Convert audio blob to features (raw audio samples)
  const audioToFeatures = useCallback(async (audioBlob: Blob): Promise<number[]> => {
    // Get expected input size from model properties, or use default
    const expectedSamples = modelProperties?.inputFeaturesCount || (TARGET_SAMPLE_RATE * WINDOW_SIZE_SECONDS)
    const sampleRate = modelProperties?.frequency || TARGET_SAMPLE_RATE

    // Create audio context if needed
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext({ sampleRate })
    }

    const audioContext = audioContextRef.current

    // Decode audio
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Get mono audio data
    const channelData = audioBuffer.getChannelData(0)
    
    // Resample if needed
    let samples: Float32Array
    if (audioBuffer.sampleRate !== sampleRate) {
      // Resample to target sample rate
      const ratio = audioBuffer.sampleRate / sampleRate
      const newLength = Math.floor(channelData.length / ratio)
      samples = new Float32Array(newLength)
      
      for (let i = 0; i < newLength; i++) {
        const srcIndex = Math.floor(i * ratio)
        samples[i] = channelData[srcIndex]
      }
    } else {
      samples = channelData
    }

    // Adjust to expected input size
    if (samples.length < expectedSamples) {
      // Pad with zeros if too short
      const padded = new Float32Array(expectedSamples)
      padded.set(samples)
      samples = padded
    } else if (samples.length > expectedSamples) {
      // Take from the middle if longer
      const start = Math.floor((samples.length - expectedSamples) / 2)
      samples = samples.slice(start, start + expectedSamples)
    }

    console.log("[v0] Audio converted: original samples", channelData.length, "-> final samples", samples.length, "(expected:", expectedSamples, ")")

    // Convert to regular array
    return Array.from(samples)
  }, [modelProperties])

  // Classify audio
  const classify = useCallback(async (audioBlob: Blob): Promise<{
    isFake: boolean
    confidence: number
    accuracy: number
    details: {
      real_score: number
      fake_score: number
      all_results: ClassifierResult[]
    }
  }> => {
    if (!classifierRef.current) {
      throw new Error("Classifier ยังไม่ได้เริ่มต้น")
    }

    try {
      // Convert audio to features
      const features = await audioToFeatures(audioBlob)
      
      console.log("[v0] Audio features extracted, length:", features.length)
      
      // Run classification
      const result = classifierRef.current.classify(features)
      
      console.log("[v0] Classification result:", result)
      
      // Find the highest scoring label
      let realScore = 0
      let fakeScore = 0
      
      for (const r of result.results) {
        const label = r.label.toLowerCase()
        if (label.includes("real") || label.includes("human") || label.includes("genuine") || label === "real") {
          realScore = r.value
        } else if (label.includes("fake") || label.includes("ai") || label.includes("synthetic") || label.includes("deepfake") || label === "fake") {
          fakeScore = r.value
        }
      }

      // If no clear labels found, assume first is real, second is fake
      if (realScore === 0 && fakeScore === 0 && result.results.length >= 2) {
        realScore = result.results[0].value
        fakeScore = result.results[1].value
      }

      // Determine if fake
      const isFake = fakeScore > realScore
      const confidence = Math.max(realScore, fakeScore)
      const accuracy = Math.round(confidence * 100)

      return {
        isFake,
        confidence,
        accuracy,
        details: {
          real_score: realScore,
          fake_score: fakeScore,
          all_results: result.results
        }
      }
    } catch (err) {
      console.error("[v0] Classification error:", err)
      throw err
    }
  }, [audioToFeatures])

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    initialize,
    classify,
    retry,
    isLoading,
    isInitialized,
    error,
    projectInfo,
    modelProperties,
    loadingProgress,
    retryCount
  }
}
