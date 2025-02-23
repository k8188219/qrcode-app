"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QRCodeGenerator from "./components/QRCodeGenerator"
import QRCodeScanner from "./components/QRCodeScanner"

export default function QRCodeApp() {
  const [activeTab, setActiveTab] = useState("generate")

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">QR Code App</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="scan">Scan</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <QRCodeGenerator />
            </TabsContent>
            <TabsContent value="scan">
              <QRCodeScanner />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

