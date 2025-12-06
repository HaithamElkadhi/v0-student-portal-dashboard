"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

export default function DebugSchemaPage() {
  const [schema, setSchema] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/get-schema")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchema(data.tables)
        } else {
          setError(data.error || "Failed to fetch schema")
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading schema...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 border-2 border-destructive">
          <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
          <p>{error}</p>
        </Card>
      </div>
    )
  }

  const prospectsTable = schema?.find(
    (table: any) => table.name === "Prospects" || table.id === "Prospects"
  )

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Airtable Schema Debug</h1>

        {prospectsTable ? (
          <Card className="p-6 border-2 mb-6">
            <h2 className="text-2xl font-bold mb-4">Table: {prospectsTable.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">Table ID: {prospectsTable.id}</p>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Fields:</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Field Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospectsTable.fields?.map((field: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-mono font-medium">{field.name}</td>
                        <td className="p-2 text-sm">{field.type}</td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {field.options ? JSON.stringify(field.options, null, 2) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 border-2">
            <p>Prospects table not found. Available tables:</p>
            <ul className="list-disc list-inside mt-2">
              {schema?.map((table: any) => (
                <li key={table.id} className="font-mono">
                  {table.name} ({table.id})
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-6 border-2 mt-6">
          <h3 className="text-lg font-semibold mb-2">Raw Schema Data:</h3>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  )
}
