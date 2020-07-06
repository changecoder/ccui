import React, { useRef, useEffect, useState } from 'react'

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}

interface ImageCropProps {
  crop: Crop;
  renderComponent: React.ReactNode;
  src: string;
}

interface Mutation {
  startX: number;
  startY: number;
  [index: string]: any;
}

const convertToPxCrop = (crop: Crop, width: number, height: number) => {
  if (crop.unit === '%') {
    return {
      x: (crop.x * width) / 100,
      y: (crop.y * height) / 100,
      width: (crop.width * width) / 100,
      height: (crop.height * height) / 100,
      unit: 'px'
    }
  }
  return {...crop}
}

const getClientPos = (e: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>): { x: number; y: number} => {
  const { pageX, pageY } = e
  return {
    x: pageX,
    y: pageY
  }
}

export default function ImageCrop(props: ImageCropProps) {
  const {
    src,
    renderComponent
  } = props

  const mediaWrapperRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const mutationRef = useRef() as React.MutableRefObject<Mutation>
  const stateRef = useRef({
    startDrag: false
  })

  const [crop, setCrop] = useState(props.crop || ImageCrop.defaultCrop)
  // Mutation
  const dragCrop = (): void => {
    setCrop({
      ...crop,
      x: crop.x + mutationRef.current.xDiff,
      y: crop.y + mutationRef.current.yDiff
    })
  }
  // Event Listener
  const onDocMouseMove = (e: MouseEvent): void => {
    if (!stateRef.current.startDrag) {
      return
    }

    const { x, y } = getClientPos(e)

    mutationRef.current.xDiff = x - mutationRef.current.startX
    mutationRef.current.yDiff = y - mutationRef.current.startY

    if (mutationRef.current.isResize){
      
    } else {
      dragCrop()
    }
  }

  const onDocMouseEnd = (e: MouseEvent): void => {
    e.preventDefault()
  }

  const onCropMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    if (stateRef.current.startDrag) {
      return
    }

    const { x, y } = getClientPos(e)

    const { position } = (e.target as HTMLDivElement).dataset
    
    mutationRef.current = {
      position: position || '',
      startX: x,
      startY: y,
      isResize: !!position
    }

  }
  // Effect
  useEffect(() => {
    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseEnd)
    return () => {
      document.removeEventListener('mousemove', onDocMouseMove)
      document.removeEventListener('mouseup', onDocMouseEnd)
    }
  })
  // Render Crop
  const getCropStyle = () => {
    const { clientWidth, clientHeight } = mediaWrapperRef.current
    const {
      x,
      y,
      width,
      height
    } = convertToPxCrop(crop, clientWidth, clientHeight)
    return {
      left: x,
      top: y,
      width,
      height
    }
  }

  const renderCropSelection = () => {
    const style = getCropStyle()
    return (
      <div 
        style={style}
        className='ccui-image-crop-selection'
        onMouseDown={onCropMouseDown}
      >
        <div>
          <div className='ccui-image-crop-drag-bar position-n' data-position='n'></div>
          <div className='ccui-image-crop-drag-bar position-s' data-position='s'></div>
          <div className='ccui-image-crop-drag-bar position-w' data-position='w'></div>
          <div className='ccui-image-crop-drag-bar position-e' data-position='e'></div>

          <div className='ccui-image-crop-drag-handle position-wn' data-position='wn'></div>
          <div className='ccui-image-crop-drag-handle position-n' data-position='n'></div>
          <div className='ccui-image-crop-drag-handle position-en' data-position='ne'></div>
          <div className='ccui-image-crop-drag-handle position-e' data-position='e'></div>
          <div className='ccui-image-crop-drag-handle position-se' data-position='se'></div>
          <div className='ccui-image-crop-drag-handle position-s' data-position='s'></div>
          <div className='ccui-image-crop-drag-handle position-ws' data-position='ws'></div>
          <div className='ccui-image-crop-drag-handle position-w' data-position='w'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='ccui-image-crop'>
      <div ref={ mediaWrapperRef }>
        {
          renderComponent || (
            <img 
              src={src} 
              />
          )
        }
      </div>
      {renderCropSelection()}
    </div>
  )
}

ImageCrop.defaultCrop = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  unit: '%'
}