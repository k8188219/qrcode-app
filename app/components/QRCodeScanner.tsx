"use client"

import { useState, useRef, useEffect } from "react"
import jsQR from "jsqr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ChevronUp, ChevronDown, Camera, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScanResult {
  id: string
  data: string
}

export default function QRCodeScanner() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    getCameras()
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (selectedCamera) {
      startCamera()
    }
  }, [selectedCamera])

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput" && !!device.deviceId)
      console.log("Available cameras:", videoDevices)
      setCameras(videoDevices)
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId)
      }
    } catch (err) {
      console.error("Error getting cameras:", err)
      setError("Failed to get camera list. Please make sure you've granted camera permissions.")
    }
  }

  const startCamera = async () => {
    console.log("Starting camera with deviceId:", selectedCamera)
    stopCamera()
    setError(null)
    try {
      const constraints = {
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
      }
      console.log("Using constraints:", constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Stream obtained:", stream)

      if (!cameras.length) {
        getCameras();
        return;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        await videoRef.current.play()
        setIsScanning(true)
        scanQRCode()
      }
    } catch (err) {
      console.error("Error accessing the camera:", err)
      setError(
        "Failed to access the camera. Please make sure you've granted camera permissions and that the camera is not in use by another application.",
      )
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        const scanFrame = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight
            canvas.width = video.videoWidth
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height)

            if (code) {
              const newResult: ScanResult = { id: Date.now().toString(), data: code.data }
              setScanResults((prevResults) => {
                if (!prevResults.some((result) => result.data === newResult.data)) {
                  return [...prevResults, newResult]
                }
                return prevResults
              })
            }

            if (isScanning) {
              requestAnimationFrame(scanFrame)
            }
          } else {
            requestAnimationFrame(scanFrame)
          }
        }

        scanFrame()
      }
    }
  }

  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId)
  }

  const deleteResult = (id: string) => {
    setScanResults((prevResults) => prevResults.filter((result) => result.id !== id))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 relative">
        <div className="space-y-4">
          {!!cameras.length && (
            <Select value={selectedCamera} onValueChange={handleCameraChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a camera" />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera.deviceId} value={camera.deviceId || `camera-${camera.deviceId}`}>
                    {camera.label || `Camera ${camera.deviceId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={startCamera} className="w-full">
            <Camera className="mr-2 h-4 w-4" /> Start Camera
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="qr-reader-container relative mt-4">
          <video ref={videoRef} className="w-full" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ display: "none" }} />
          <div className="absolute inset-0 bg-opacity-50">
            <div
              className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 transition-all duration-300 ease-in-out ${isOverlayMinimized ? "h-12" : "max-h-64"}`}
            >
              <div className="flex justify-between items-center p-2 border-b">
                <h3 className="font-semibold">Scanned Results:</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}>
                  {isOverlayMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              {!isOverlayMinimized && (
                <div className="p-2 overflow-y-auto max-h-52 space-y-2">
                  {scanResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between bg-white p-2 rounded-md shadow">
                      <p className="break-all mr-2 text-sm flex-grow">{result.data}</p>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(result.data)}
                          className="mr-1"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteResult(result.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

