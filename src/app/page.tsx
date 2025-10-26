'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Server, 
  Wifi, 
  Shield, 
  Users, 
  Zap, 
  Globe, 
  CheckCircle, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Database,
  Lock,
  Network,
  BarChart3,
  Settings,
  Router,
  Cloud,
  Cpu,
  HardDrive,
  Activity
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    plan: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOrderNow = (planType: string) => {
    setSelectedPlan(planType)
    setContactForm(prev => ({ ...prev, plan: planType }))
    setOrderDialogOpen(true)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Call the contact API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        toast({
          title: "Pesanan Diterima!",
          description: "Tim kami akan menghubungi Anda dalam 24 jam.",
        })
        
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          company: '',
          plan: '',
          message: ''
        })
        setOrderDialogOpen(false)
      } else {
        throw new Error('Failed to submit order')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim pesanan. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Rp 500.000',
      period: '/bulan',
      description: 'Cocok untuk usaha kecil dan startup',
      features: [
        '50 Pengguna Aktif',
        '1 RADIUS Server',
        'Support Email',
        '99.5% Uptime',
        'Basic Analytics',
        'SSL Certificate'
      ],
      notIncluded: [
        'Custom Configuration',
        'Priority Support',
        'Advanced Analytics',
        'Multi-Server'
      ],
      popular: false,
      icon: <Server className="h-6 w-6" />
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'Rp 1.500.000',
      period: '/bulan',
      description: 'Ideal untuk perusahaan menengah',
      features: [
        '200 Pengguna Aktif',
        '2 RADIUS Server',
        'Support 24/7',
        '99.9% Uptime',
        'Advanced Analytics',
        'SSL Certificate',
        'Custom Configuration',
        'API Access'
      ],
      notIncluded: [
        'Dedicated Server',
        'White Label',
        'Multi-Location'
      ],
      popular: true,
      icon: <Network className="h-6 w-6" />
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Rp 5.000.000',
      period: '/bulan',
      description: 'Solusi lengkap untuk perusahaan besar',
      features: [
        'Unlimited Pengguna',
        'Dedicated RADIUS Server',
        'Priority Support 24/7',
        '99.99% Uptime',
        'Real-time Analytics',
        'Custom SSL',
        'Full Customization',
        'API Access',
        'Multi-Location',
        'White Label Option',
        'Backup & Recovery'
      ],
      notIncluded: [],
      popular: false,
      icon: <Cloud className="h-6 w-6" />
    }
  ]

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: 'Keamanan Terjamin',
      description: 'Enkripsi data end-to-end dengan protokol keamanan terkini untuk melindungi informasi pengguna.'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: 'Performa Tinggi',
      description: 'Server high-performance dengan latency rendah dan throughput tinggi untuk koneksi yang stabil.'
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Manajemen Mudah',
      description: 'Dashboard intuitif untuk mengelola pengguna, monitoring real-time, dan laporan lengkap.'
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: 'Skalabilitas Global',
      description: 'Infrastruktur global yang dapat diskalakan sesuai kebutuhan bisnis Anda.'
    },
    {
      icon: <Clock className="h-8 w-8 text-red-600" />,
      title: 'Uptime 99.9%',
      description: 'Garansi uptime 99.9% dengan monitoring 24/7 dan backup otomatis.'
    },
    {
      icon: <Settings className="h-8 w-8 text-indigo-600" />,
      title: 'Konfigurasi Fleksibel',
      description: 'Sesuaikan pengaturan RADIUS sesuai kebutuhan spesifik infrastruktur Anda.'
    }
  ]

  const technicalSpecs = [
    {
      category: 'Server Specifications',
      items: [
        { label: 'Processor', value: 'Intel Xeon E5-2680 v4' },
        { label: 'RAM', value: '32GB DDR4 ECC' },
        { label: 'Storage', value: '1TB NVMe SSD RAID-1' },
        { label: 'Network', value: '1Gbps Dedicated Port' }
      ]
    },
    {
      category: 'RADIUS Features',
      items: [
        { label: 'Protocol Support', value: 'RADIUS, CoA, DM' },
        { label: 'Authentication', value: 'PAP, CHAP, MS-CHAPv2, EAP' },
        { label: 'Database', value: 'MySQL/PostgreSQL with Replication' },
        { label: 'Backup', value: 'Daily Automatic Backup' }
      ]
    },
    {
      category: 'Security & Compliance',
      items: [
        { label: 'Encryption', value: 'AES-256, TLS 1.3' },
        { label: 'Compliance', value: 'ISO 27001, SOC 2 Type II' },
        { label: 'Monitoring', value: '24/7 Security Monitoring' },
        { label: 'Audit Logs', value: 'Complete Audit Trail' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MLJNET RADIUS</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Fitur
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Harga
              </Link>
              <Link href="#specs" className="text-gray-700 hover:text-blue-600 transition-colors">
                Spesifikasi
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Kontak
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Mulai Gratis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            🚀 Solusi RADIUS Server Terpercaya
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sewa RADIUS Server
            <span className="text-blue-600"> Professional</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Solusi autentikasi network yang aman, andal, dan skalabel untuk ISP, Hotel, WiFi Provider, dan Enterprise. 
            Deploy dalam hitungan menit, tanpa perlu investasi hardware mahal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Coba Gratis 7 Hari
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              <Phone className="mr-2 h-5 w-5" />
              Konsultasi Gratis
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Klien Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">5 Tahun</div>
              <div className="text-gray-600">Pengalaman</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fitur lengkap untuk mendukung kebutuhan autentikasi network Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Paket Harga yang Fleksibel
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pilih paket yang sesuai dengan kebutuhan dan skala bisnis Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl' : 'hover:shadow-lg transition-shadow'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Paling Populer
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 opacity-50">
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleOrderNow(plan.name)}
                  >
                    {plan.popular ? 'Pilih Sekarang' : 'Pilih Paket'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section id="specs" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Spesifikasi Teknis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Infrastruktur modern dengan teknologi terkini
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {technicalSpecs.map((spec, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{spec.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {spec.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cocok untuk Berbagai Industri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solusi autentikasi yang fleksibel untuk berbagai kebutuhan
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Wifi className="h-8 w-8" />, title: 'ISP Provider', desc: 'Manajemen pelanggan broadband' },
              { icon: <Router className="h-8 w-8" />, title: 'Hotel & Hospitality', desc: 'WiFi guest authentication' },
              { icon: <Network className="h-8 w-8" />, title: 'Enterprise', desc: 'Corporate network access' },
              { icon: <Cloud className="h-8 w-8" />, title: 'WiFi Provider', desc: 'Public hotspot management' }
            ].map((useCase, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center text-blue-600 mb-4">
                    {useCase.icon}
                  </div>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{useCase.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Memulai?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Coba gratis 7 hari. Tidak perlu kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Mulai Uji Coba Gratis
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Jadwalkan Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hubungi Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tim kami siap membantu menemukan solusi terbaik untuk Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">info@mljnet-radius.com</p>
                <p className="text-gray-600">support@mljnet-radius.com</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <CardTitle>Telepon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">+62 21 1234 5678</p>
                <p className="text-gray-600">WhatsApp: +62 812 3456 7890</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <CardTitle>Alamat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Jl. Teknologi No. 123</p>
                <p className="text-gray-600">Jakarta 12345, Indonesia</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Server className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">MLJNET RADIUS</span>
              </div>
              <p className="text-gray-400">
                Solusi RADIUS server terpercaya untuk kebutuhan autentikasi network Anda.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-gray-400">
                <li>RADIUS Server</li>
                <li>Network Monitoring</li>
                <li>Custom Configuration</li>
                <li>Technical Support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Tentang Kami</li>
                <li>Karir</li>
                <li>Blog</li>
                <li>Partner</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>SLA</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MLJNET RADIUS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pesan Paket {selectedPlan}</DialogTitle>
            <DialogDescription>
              Isi form di bawah ini untuk memesan paket {selectedPlan}. Tim kami akan menghubungi Anda segera.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitOrder}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telepon
                </Label>
                <Input
                  id="phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Perusahaan
                </Label>
                <Input
                  id="company"
                  value={contactForm.company}
                  onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Pesan
                </Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="col-span-3"
                  placeholder="Ceritakan kebutuhan Anda..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOrderDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Pesanan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}