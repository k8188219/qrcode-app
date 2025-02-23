"use client"

import { useState, useRef, useEffect } from "react"
import QRCode from "qrcode"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function QRCodeGenerator() {
  const [inputText, setInputText] = useState("")
  const [qrCodeText, setQRCodeText] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (qrCodeText && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrCodeText, { width: 200 }, (error) => {
        if (error) console.error("Error generating QR code:", error)
      })
    }
  }, [qrCodeText])

  const generateQRCode = () => {
    if (inputText.trim() !== "") {
      setQRCodeText(inputText)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Input
          type="text"
          placeholder="Enter text or URL"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full"
        />
        <Button onClick={generateQRCode} className="w-full">
          Generate QR Code
        </Button>
        {qrCodeText && (
          <div className="flex justify-center mt-4">
            <canvas ref={canvasRef} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

