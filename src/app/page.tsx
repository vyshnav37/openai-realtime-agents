'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropletIcon, 
  HomeIcon, 
  AlertTriangleIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DownloadIcon,
  MessageSquareIcon,
  BarChartIcon
} from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000/api'

interface DashboardStats {
  total_villas: number
  total_records: number
  today_records: number
  low_ph_alerts: number
  fountain_issues: number
}

interface MaintenanceRecord {
  id: number
  villa_number: string
  timestamp: string
  chlorine_level: number | null
  ph_level: number | null
  temperature: number | null
  status: string
  notes: string
  staff_name: string
}

interface Villa {
  id: number
  villa_number: string
  series: string
  status: string
}

export default function PoolMaintenanceDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_villas: 0,
    total_records: 0,
    today_records: 0,
    low_ph_alerts: 0,
    fountain_issues: 0
  })
  
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [villas, setVillas] = useState<Villa[]>([])
  const [loading, setLoading] = useState(false)
  
  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  const loadDashboardData = async () => {
    try {
      const [statsRes, recordsRes, villasRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard-stats`),
        fetch(`${API_BASE_URL}/maintenance-records`),
        fetch(`${API_BASE_URL}/villas`)
      ])
      
      const statsData = await statsRes.json()
      const recordsData = await recordsRes.json()
      const villasData = await villasRes.json()
      
      setStats(statsData)
      setMaintenanceRecords(recordsData)
      setVillas(villasData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }
  
  const processWhatsAppMessage = async () => {
    if (!whatsappMessage.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/process-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: whatsappMessage })
      })
      
      const result = await response.json()
      setProcessingResult(result)
      
      if (result.success) {
        setWhatsappMessage('')
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error processing message:', error)
      setProcessingResult({ success: false, message: 'Error processing message' })
    } finally {
      setLoading(false)
    }
  }
  
  const exportToExcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export-excel`)
      const result = await response.json()
      
      if (result.success) {
        alert(`Excel file exported successfully! ${result.records_count} records exported.`)
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OCC': return 'bg-red-500'
      case 'VC': return 'bg-green-500'
      case 'VD': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'OCC': return 'Occupied'
      case 'VC': return 'Vacant Clean'
      case 'VD': return 'Vacant Dirty'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏖️ Luxury Villa Pool Maintenance Dashboard
          </h1>
          <p className="text-gray-600">
            WhatsApp to Excel automation for pool and fountain maintenance
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Villas</CardTitle>
              <HomeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_villas}</div>
              <p className="text-xs text-muted-foreground">Series 1-9</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <BarChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_records}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Records</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today_records}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">pH Alerts</CardTitle>
              <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.low_ph_alerts}</div>
              <p className="text-xs text-muted-foreground">pH &lt; 7.2</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fountain Issues</CardTitle>
              <DropletIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.fountain_issues}</div>
              <p className="text-xs text-muted-foreground">Unresolved</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="message-processor" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="message-processor">Message Processor</TabsTrigger>
            <TabsTrigger value="maintenance-records">Maintenance Records</TabsTrigger>
            <TabsTrigger value="villa-status">Villa Status</TabsTrigger>
            <TabsTrigger value="export">Export & Reports</TabsTrigger>
          </TabsList>
          
          {/* Message Processor Tab */}
          <TabsContent value="message-processor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareIcon className="h-5 w-5" />
                  WhatsApp Message Processor
                </CardTitle>
                <CardDescription>
                  Paste WhatsApp messages here to automatically extract maintenance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Message</label>
                  <Textarea
                    placeholder="Example: 507 pool chlorine 1.2 pH 7.5 temperature 28"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={processWhatsAppMessage}
                    disabled={loading || !whatsappMessage.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Process Message'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setWhatsappMessage('')
                      setProcessingResult(null)
                    }}
                  >
                    Clear
                  </Button>
                </div>
                
                {/* Processing Result */}
                {processingResult && (
                  <Alert className={processingResult.success ? 'border-green-500' : 'border-red-500'}>
                    <AlertDescription>
                      {processingResult.success ? (
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span>
                            Successfully processed {processingResult.type} maintenance for Villa {processingResult.villa_number}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                          <span>{processingResult.message}</span>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Sample Messages */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Sample Messages:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <strong>Pool Maintenance:</strong> "507 pool chlorine 1.2 pH 7.5 temperature 28"
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Fountain Issue:</strong> "702 fountain nozzle broken need repair"
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Status Update:</strong> "301 occupied guest checked in"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Maintenance Records Tab */}
          <TabsContent value="maintenance-records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Maintenance Records</CardTitle>
                <CardDescription>
                  Latest pool and fountain maintenance activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRecords.slice(0, 10).map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Villa {record.villa_number}</Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusText(record.status)}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(record.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {record.chlorine_level && (
                          <div>
                            <span className="font-medium">Chlorine:</span>
                            <span className="ml-1">{record.chlorine_level} ppm</span>
                          </div>
                        )}
                        {record.ph_level && (
                          <div>
                            <span className="font-medium">pH:</span>
                            <span className={`ml-1 ${record.ph_level < 7.2 ? 'text-red-600 font-semibold' : ''}`}>
                              {record.ph_level}
                            </span>
                          </div>
                        )}
                        {record.temperature && (
                          <div>
                            <span className="font-medium">Temperature:</span>
                            <span className="ml-1">{record.temperature}°C</span>
                          </div>
                        )}
                        {record.staff_name && (
                          <div>
                            <span className="font-medium">Staff:</span>
                            <span className="ml-1">{record.staff_name}</span>
                          </div>
                        )}
                      </div>
                      
                      {record.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Villa Status Tab */}
          <TabsContent value="villa-status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Villa Status Overview</CardTitle>
                <CardDescription>
                  Current status of all villas organized by series
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({length: 9}, (_, i) => i + 1).map((series) => {
                    const seriesVillas = villas.filter(v => v.series === `Series${series}`)
                    return (
                      <div key={series} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Series {series}</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {seriesVillas.map((villa) => (
                            <div
                              key={villa.id}
                              className={`p-2 rounded text-center text-sm font-medium text-white ${getStatusColor(villa.status)}`}
                            >
                              {villa.villa_number}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-gray-600">
                          {seriesVillas.length} villas
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DownloadIcon className="h-5 w-5" />
                  Export & Reports
                </CardTitle>
                <CardDescription>
                  Generate Excel reports and export maintenance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Button onClick={exportToExcel} className="w-full">
                      Export All Records to Excel
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">
                      Exports all maintenance records to Excel format with proper formatting
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Report Features:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Automatic villa series categorization</li>
                      <li>• pH level highlighting for alerts</li>
                      <li>• Fountain issues in separate tabs</li>
                      <li>• Time-based filtering options</li>
                      <li>• Professional formatting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
