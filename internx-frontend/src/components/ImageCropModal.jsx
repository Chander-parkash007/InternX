import { useState, useCallback, useRef, useEffect } from 'react'

function ImageCropModal({ image, onClose, onCropComplete, aspectRatio = 1, title = 'Crop Image' }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  
  const isCover = aspectRatio !== 1
  // For cover: use full width of modal (680px) with 3:1 aspect ratio
  const cropWidth = isCover ? 680 : 340
  const cropHeight = isCover ? 227 : 340  // 680/3 ≈ 227 for 3:1 ratio
  const containerHeight = isCover ? 340 : 450

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }
    
    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp)
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    e.preventDefault()
    
    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y
    
    setCrop(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getCroppedImg = async () => {
    if (!imageRef.current || !containerRef.current) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const img = imageRef.current
    const container = containerRef.current
    
    // Get the actual displayed dimensions
    const imgRect = img.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    // Calculate scale between natural size and displayed size
    const scaleX = img.naturalWidth / imgRect.width
    const scaleY = img.naturalHeight / imgRect.height
    
    // Calculate the center of the container
    const centerX = containerRect.width / 2
    const centerY = containerRect.height / 2
    
    // Calculate where the crop box is relative to the image
    const imgCenterX = imgRect.width / 2
    const imgCenterY = imgRect.height / 2
    
    // Position of crop box relative to image
    const cropBoxLeft = imgCenterX - crop.x - cropWidth / 2
    const cropBoxTop = imgCenterY - crop.y - cropHeight / 2
    
    // Convert to natural image coordinates
    const sourceX = cropBoxLeft * scaleX
    const sourceY = cropBoxTop * scaleY
    const sourceWidth = cropWidth * scaleX
    const sourceHeight = cropHeight * scaleY
    
    // Set canvas size to desired output size
    const outputWidth = isCover ? 1200 : 400
    const outputHeight = isCover ? 400 : 400
    canvas.width = outputWidth
    canvas.height = outputHeight
    
    // Draw the cropped portion
    ctx.drawImage(
      img,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleSave = async () => {
    const croppedBlob = await getCroppedImg()
    if (croppedBlob) {
      onCropComplete(croppedBlob)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: isCover ? '760px' : '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <div 
            ref={containerRef}
            className="crop-container"
            style={{
              position: 'relative',
              width: '100%',
              height: `${containerHeight}px`,
              background: '#000',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${crop.x}px), calc(-50% + ${crop.y}px))`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}>
              <img
                ref={imageRef}
                src={image}
                alt="Crop"
                style={{
                  display: 'block',
                  maxWidth: 'none',
                  width: isCover ? 'auto' : 'auto',
                  height: isCover ? 'auto' : '450px',
                  maxHeight: isCover ? `${containerHeight}px` : 'none',
                  minWidth: isCover ? `${containerHeight * 1.5}px` : 'auto',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none'
                }}
                draggable={false}
                onLoad={(e) => {
                  // Auto-fit image on load
                  if (isCover) {
                    const img = e.target
                    const imgAspect = img.naturalWidth / img.naturalHeight
                    const cropAspect = cropWidth / cropHeight
                    
                    // If image is narrower than crop area, zoom to fit width
                    if (imgAspect < cropAspect) {
                      const scale = cropWidth / (img.width * 0.9)
                      setZoom(Math.max(1, scale))
                    }
                  }
                }}
              />
            </div>
            {/* Crop overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${cropWidth}px`,
              height: `${cropHeight}px`,
              border: '3px solid white',
              borderRadius: isCover ? '8px' : '50%',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none'
            }} />
            {/* Corner guides for cover photo */}
            {isCover && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${cropWidth}px`,
                  height: `${cropHeight}px`,
                  pointerEvents: 'none'
                }}>
                  {/* Top-left corner */}
                  <div style={{
                    position: 'absolute',
                    top: -1,
                    left: -1,
                    width: '20px',
                    height: '20px',
                    borderTop: '4px solid white',
                    borderLeft: '4px solid white',
                    borderRadius: '8px 0 0 0'
                  }} />
                  {/* Top-right corner */}
                  <div style={{
                    position: 'absolute',
                    top: -1,
                    right: -1,
                    width: '20px',
                    height: '20px',
                    borderTop: '4px solid white',
                    borderRight: '4px solid white',
                    borderRadius: '0 8px 0 0'
                  }} />
                  {/* Bottom-left corner */}
                  <div style={{
                    position: 'absolute',
                    bottom: -1,
                    left: -1,
                    width: '20px',
                    height: '20px',
                    borderBottom: '4px solid white',
                    borderLeft: '4px solid white',
                    borderRadius: '0 0 0 8px'
                  }} />
                  {/* Bottom-right corner */}
                  <div style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: '20px',
                    height: '20px',
                    borderBottom: '4px solid white',
                    borderRight: '4px solid white',
                    borderRadius: '0 0 8px 0'
                  }} />
                </div>
              </>
            )}
          </div>
          
          <div style={{ padding: '20px', background: 'var(--bg-3)' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
                Zoom
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-2)', 
              lineHeight: '1.6',
              background: 'var(--surface)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>
                💡 Tips:
              </div>
              {isCover ? (
                <>
                  <div>• Drag the image to reposition it within the frame</div>
                  <div>• Use the zoom slider to adjust the size</div>
                  <div>• Recommended: Upload images at least <strong>1200x400px</strong></div>
                  <div>• Best results: <strong>1920x640px</strong> or larger</div>
                  <div>• Aspect ratio: <strong>3:1</strong> (wide landscape)</div>
                </>
              ) : (
                <>
                  <div>• Drag the image to reposition it within the circle</div>
                  <div>• Use the zoom slider to adjust the size</div>
                  <div>• Recommended: Upload square images at least <strong>400x400px</strong></div>
                  <div>• Best results: <strong>800x800px</strong> or larger</div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-ghost btn-md" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-md" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropModal
