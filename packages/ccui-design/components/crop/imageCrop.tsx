import React, { useRef, useEffect, useState } from 'react'
import classnames from 'classnames'

import shallowEqual from '../_util/shallowEqual.js'

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: string;
}

interface ImageCropProps {
  crop?: Crop;
  renderComponent?: React.ReactNode;
  className?: string;
  crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  onImageLoaded?: (element: EventTarget) => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  children?: React.ReactChildren;
  keepSelection?: boolean;
  minWidth?: number;
  maxWidth?: number; 
  minHeight?: number;
  maxHeight?: number;
  onChange?: (pixelCrop: Crop, percentCrop: Crop) => void;
  onDragStart?: (e: MouseEvent) => void;
  onDragEnd?:(e: MouseEvent) => void;
  onComplete?: (pixelCrop: Crop, percentCrop: Crop) => void;
  src?: string;
}

interface Mutation {
  clientStartX: number;
  clientStartY: number;
  [index: string]: any;
}

const containCrop = (crop: Crop, imageWidth: number, imageHeight: number): Crop => {
  const pixelCrop = convertToPixelCrop(crop, imageWidth, imageHeight)
  const contained = { ...pixelCrop }

  if (pixelCrop.x < 0) {
    contained.x = 0
    contained.width += pixelCrop.x
  } else if (pixelCrop.x + pixelCrop.width > imageWidth) {
    contained.width = imageWidth - pixelCrop.x
  }

  if (pixelCrop.y + pixelCrop.height > imageHeight) {
    contained.height = imageHeight - pixelCrop.y
  }

  return contained
}

const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
}
const isCropValid = (crop: Crop) =>  {
  return crop && !isNaN(crop.width) && !isNaN(crop.height)
}

const convertToPercentCrop = (crop: Crop, imageWidth: number, imageHeight: number): Crop => {
  if (crop.unit === '%') {
    return crop
  }

  return {
    unit: '%',
    x: (crop.x / imageWidth) * 100,
    y: (crop.y / imageHeight) * 100,
    width: (crop.width / imageWidth) * 100,
    height: (crop.height / imageHeight) * 100,
  };
}

const convertToPixelCrop = (crop: Crop, imageWidth: number, imageHeight: number) => {
  if (!crop.unit) {
    return { ...crop, unit: 'px' };
  }
  if (crop.unit === 'px') {
    return crop;
  }

  return {
    x: (crop.x * imageWidth) / 100,
    y: (crop.y * imageHeight) / 100,
    width: (crop.width * imageWidth) / 100,
    height: (crop.height * imageHeight) / 100,
    unit: 'px'
  }
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
    renderComponent,
    className,
    style,
    crossOrigin,
    imageStyle,
    onImageError,
    children,
    keepSelection,
    onChange,
    onDragStart,
    onDragEnd,
    onComplete,
    crop = ImageCrop.defaultCrop
  } = props

  const mediaWrapperRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const mutationRef = useRef() as React.MutableRefObject<Mutation>
  const componentRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const imageRef = useRef() as React.MutableRefObject<HTMLImageElement>
  const cropSelectRef = useRef() as React.MutableRefObject<HTMLImageElement>

  const [cropActive, setCropActive] = useState(false)
  const [drawNewCrop, setDrawNewCrop] = useState(false)

  const stateRef = useRef({
    mouseDownOnCrop: false,
    startDrag: false
  })

  // DOM 
  const getDocumentOffset = () => {
    const { clientTop = 0, clientLeft = 0 } = document.documentElement || {}
    return { clientTop, clientLeft }
  }
  const getWindowOffset = () => {
    const { pageYOffset = 0, pageXOffset = 0 } = window
    return { pageYOffset, pageXOffset }
  }
  const getElementOffset = (el: HTMLDivElement): {top: number, left: number} => {
    const rect = el.getBoundingClientRect()
    const doc = getDocumentOffset()
    const win = getWindowOffset()

    const top = rect.top + win.pageYOffset - doc.clientTop
    const left = rect.left + win.pageXOffset - doc.clientLeft

    return { top, left }
  }
  // Mutation
  const resizeCrop = (): Crop => {
    const mutation = mutationRef.current

    if (mutation.xInverse) {
      mutation.xDiff -= mutation.cropStartWidth * 2
      mutation.xDiffPc -= mutation.cropStartWidth * 2
    }
    if (mutation.yInverse) {
      mutation.yDiff -= mutation.cropStartHeight * 2
      mutation.yDiffPc -= mutation.cropStartHeight * 2
    }

    const newSize = getNewSize()

    let newX = mutation.cropStartX
    let newY = mutation.cropStartY

    const nextCrop = makeNewCrop()

    if (mutation.xCrossOver) {
      newX = nextCrop.x + (nextCrop.width - newSize.width)
    }

    if (mutation.yCrossOver) {
      if (mutation.lastYCrossover === false) {
        newY = nextCrop.y - newSize.height
      } else {
        newY = nextCrop.y + (nextCrop.height - newSize.height)
      }
    }

    const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current

    const containedCrop = containCrop(
      {
        unit: nextCrop.unit,
        x: newX,
        y: newY,
        width: newSize.width,
        height: newSize.height
      },
      width,
      height
    )
    const { position } = mutation

    if (ImageCrop.xyPositions.includes(position)) {
      nextCrop.x = containedCrop.x
      nextCrop.y = containedCrop.y
      nextCrop.width = containedCrop.width
      nextCrop.height = containedCrop.height
    } else if (ImageCrop.xPositions.includes(position)) {
      nextCrop.x = containedCrop.x
      nextCrop.width = containedCrop.width
    } else if (ImageCrop.yPositions.includes(position)) {
      nextCrop.y = containedCrop.y
      nextCrop.height = containedCrop.height
    }

    mutation.lastYCrossover = mutation.yCrossOver

    return nextCrop
  }

  const dragCrop = (): Crop => {
    const nextCrop = makeNewCrop()

    const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current
    nextCrop.x = clamp(mutationRef.current.cropStartX + mutationRef.current.xDiff, 0, width - nextCrop.width)
    nextCrop.y = clamp(mutationRef.current.cropStartY + mutationRef.current.yDiff, 0, height - nextCrop.height)

    return nextCrop
  }
  // Event Listener
  const onDocMouseMove = (e: MouseEvent): void => {
    if (!stateRef.current.mouseDownOnCrop) {
      return
    }

    e.preventDefault()

    if (!stateRef.current.startDrag) {
      stateRef.current.startDrag = true
      onDragStart && onDragStart(e)
    }

    const { x, y } = getClientPos(e)

    mutationRef.current.xDiff = x - mutationRef.current.clientStartX
    mutationRef.current.yDiff = y - mutationRef.current.clientStartY

    let nextCrop: Crop

    if (mutationRef.current.isResize){
      nextCrop = resizeCrop()
    } else {
      nextCrop = dragCrop()
    }

    if (!shallowEqual(nextCrop, crop)) {
      const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current
      onChange && onChange(convertToPixelCrop(nextCrop, width, height), convertToPercentCrop(nextCrop, width, height))
    }
  }

  const onDocMouseEnd = (e: MouseEvent): void => {
    if (stateRef.current.mouseDownOnCrop) {
      stateRef.current.mouseDownOnCrop = false
      stateRef.current.startDrag = false

      const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current

      onDragEnd && onDragEnd(e);
      onComplete && onComplete(convertToPixelCrop(crop, width, height), convertToPercentCrop(crop, width, height))

      setCropActive(false)
      setDrawNewCrop(false)
    }

  }

  const onCropMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault()

    componentRef.current.focus({ preventScroll: true });

    const { x, y } = getClientPos(e)

    const { position = '' } = (e.target as HTMLDivElement).dataset
    
    const xInverse = ['nw', 'w', 'sw'].includes(position)
    const yInverse = ['nw', 'n', 'ne'].includes(position)

    const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current
    const pixelCrop = convertToPixelCrop(crop, width, height)
    
    mutationRef.current = {
      clientStartX: x,
      clientStartY: y,
      cropStartWidth: pixelCrop.width,
      cropStartHeight: pixelCrop.height,
      cropStartX: xInverse ? pixelCrop.x + pixelCrop.width : pixelCrop.x,
      cropStartY: yInverse ? pixelCrop.y + pixelCrop.height : pixelCrop.y,
      xInverse,
      yInverse,
      xCrossOver: xInverse,
      yCrossOver: yInverse,
      startXCrossOver: xInverse,
      startYCrossOver: yInverse,
      position: position || '',
      isResize: !!position
    }

    stateRef.current.mouseDownOnCrop = true
    setCropActive(true)
  }
  
  const onComponentMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    const componentEl = mediaWrapperRef.current.firstChild

    if (e.target !== componentEl || !componentEl.contains(e.target as HTMLDivElement)) {
      return
    }

    if (keepSelection && isCropValid(crop)) {
      return
    }

    e.preventDefault()

    const clientPos = getClientPos(e)

    // Focus for detecting keypress.
    componentRef.current.focus({ preventScroll: true }); // All other browsers

    const mediaOffset = getElementOffset(mediaWrapperRef.current)
    const x = clientPos.x - mediaOffset.left
    const y = clientPos.y - mediaOffset.top

    const nextCrop = {
      unit: 'px',
      x,
      y,
      width: 0,
      height: 0,
    }

    mutationRef.current ={
      clientStartX: clientPos.x,
      clientStartY: clientPos.y,
      cropStartWidth: nextCrop.width,
      cropStartHeight: nextCrop.height,
      cropStartX: nextCrop.x,
      cropStartY: nextCrop.y,
      xInverse: false,
      yInverse: false,
      xCrossOver: false,
      yCrossOver: false,
      startXCrossOver: false,
      startYCrossOver: false,
      isResize: true,
      position: 'nw',
    }

    stateRef.current.mouseDownOnCrop = true

    const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current

    onChange && onChange(convertToPixelCrop(nextCrop, width, height), convertToPercentCrop(nextCrop, width, height))

    setCropActive(true)
    setDrawNewCrop(true)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const { onImageLoaded } = props
    onImageLoaded && onImageLoaded(e.target)
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
  const getNewSize = (): { width: number; height: number } => {
    const { minWidth = 0, maxWidth, minHeight = 0, maxHeight } = props
    const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current
    const mutation = mutationRef.current
    let newWidth = mutation.cropStartWidth + mutation.xDiff

    if (mutation.xCrossOver) {
      newWidth = Math.abs(newWidth)
    }

    newWidth = clamp(newWidth, minWidth, maxWidth || width)

    let newHeight = mutation.cropStartHeight + mutation.yDiff

    if (mutation.yCrossOver) {
      newHeight = Math.min(Math.abs(newHeight), mutation.cropStartY)
    }

    newHeight = clamp(newHeight, minHeight, maxHeight || height)

    return {
      width: newWidth,
      height: newHeight
    }
  }
  const makeNewCrop = (unit = 'px') => {
    const newCrop = { ...ImageCrop.defaultCrop,  ...crop }

    const { clientWidth: width, clientHeight: height } = mediaWrapperRef.current

    return unit === 'px' ? convertToPixelCrop(newCrop, width, height) : convertToPercentCrop(newCrop, width, height);
  }

  const getCropStyle = () => {
    const newCrop = makeNewCrop(crop ? crop.unit : 'px')
    return {
      left: `${newCrop.x}${newCrop.unit}`,
      top: `${newCrop.y}${newCrop.unit}`,
      width: `${newCrop.width}${newCrop.unit}`,
      height: `${newCrop.height}${newCrop.unit}`
    }
  }

  const createCropSelection = () => {
    const style = getCropStyle()
    return (
      <div 
        ref={cropSelectRef}
        style={style}
        className='ccui-image-crop-selection'
        onMouseDown={onCropMouseDown}
        tabIndex={0}
      >
        <div>
          <div className='ccui-image-crop-drag-bar position-n' data-position='n'></div>
          <div className='ccui-image-crop-drag-bar position-s' data-position='s'></div>
          <div className='ccui-image-crop-drag-bar position-w' data-position='w'></div>
          <div className='ccui-image-crop-drag-bar position-e' data-position='e'></div>

          <div className='ccui-image-crop-drag-handle position-ne' data-position='ne'></div>
          <div className='ccui-image-crop-drag-handle position-n' data-position='n'></div>
          <div className='ccui-image-crop-drag-handle position-nw' data-position='nw'></div>
          <div className='ccui-image-crop-drag-handle position-e' data-position='e'></div>
          <div className='ccui-image-crop-drag-handle position-se' data-position='se'></div>
          <div className='ccui-image-crop-drag-handle position-s' data-position='s'></div>
          <div className='ccui-image-crop-drag-handle position-sw' data-position='sw'></div>
          <div className='ccui-image-crop-drag-handle position-w' data-position='w'></div>
        </div>
      </div>
    )
  }

  const componentClasses = classnames('ccui-image-crop', className, {
    'ccui-image-crop-active': cropActive,
    'ccui-image-crop-new': drawNewCrop
  })

  const cropSelection = isCropValid(crop) && componentRef.current ? createCropSelection() : null

  return (
    <div
      ref={componentRef}
      className={componentClasses}
      onMouseDown={onComponentMouseDown}
      style={style}
      tabIndex={0}
    >
      <div ref={mediaWrapperRef}>
        {
          renderComponent || (
            <img 
              ref={imageRef}
              className='ccui-image-crop-image'
              src={src}
              crossOrigin={crossOrigin}
              style={imageStyle}
              onLoad={onImageLoad}
              onError={onImageError}
              />
          )
        }
      </div>
      {children}
      {cropSelection}
    </div>
  )
}

ImageCrop.xyPositions = ['nw', 'ne', 'se', 'sw']
ImageCrop.xPositions = ['e', 'w']
ImageCrop.yPositions = ['n', 's']

ImageCrop.defaultCrop = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  unit: '%'
}