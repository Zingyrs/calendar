import { Calendar } from "@/components/calendar"
import Script from "next/script"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Script src="https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js" strategy="beforeInteractive" />
      <div className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Календарь планирования выходов</h1>
        <Calendar />
      </div>
    </main>
  )
}
