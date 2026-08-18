'use client'

import { useState, useEffect } from 'react'

export default function DeviceToggle() {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop')

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      const toggle = document.createElement('div')
      toggle.id = 'device-toggle'
      toggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        background: white;
        border: 2px solid #ec4899;
        border-radius: 12px;
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        gap: 8px;
        font-family: system-ui, sans-serif;
      `
      
      const mobileBtn = document.createElement('button')
      mobileBtn.textContent = '📱'
      mobileBtn.style.cssText = `
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 20px;
        background: ${device === 'mobile' ? '#ec4899' : '#f3f4f6'};
        color: ${device === 'mobile' ? 'white' : 'black'};
        transition: all 0.3s;
      `
      
      const desktopBtn = document.createElement('button')
      desktopBtn.textContent = '💻'
      desktopBtn.style.cssText = `
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 20px;
        background: ${device === 'desktop' ? '#ec4899' : '#f3f4f6'};
        color: ${device === 'desktop' ? 'white' : 'black'};
        transition: all 0.3s;
      `
      
      mobileBtn.onclick = () => {
        setDevice('mobile')
        document.documentElement.style.maxWidth = '430px'
        document.documentElement.style.margin = '0 auto'
        document.documentElement.style.boxShadow = '0 0 40px rgba(0,0,0,0.2)'
        document.documentElement.style.minHeight = '100vh'
        document.documentElement.style.background = '#e5e7eb'
        mobileBtn.style.background = '#ec4899'
        mobileBtn.style.color = 'white'
        desktopBtn.style.background = '#f3f4f6'
        desktopBtn.style.color = 'black'
      }
      
      desktopBtn.onclick = () => {
        setDevice('desktop')
        document.documentElement.style.maxWidth = '100%'
        document.documentElement.style.margin = '0'
        document.documentElement.style.boxShadow = 'none'
        document.documentElement.style.minHeight = 'auto'
        document.documentElement.style.background = 'white'
        desktopBtn.style.background = '#ec4899'
        desktopBtn.style.color = 'white'
        mobileBtn.style.background = '#f3f4f6'
        mobileBtn.style.color = 'black'
      }
      
      toggle.appendChild(mobileBtn)
      toggle.appendChild(desktopBtn)
      document.body.appendChild(toggle)
      
      return () => {
        document.getElementById('device-toggle')?.remove()
      }
    }
  }, [device])

  return null
}