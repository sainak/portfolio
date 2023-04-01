/*
 * Inspired from
 * https://github.com/mattwilliams85/mattwilliams85.github.io/blob/master/scripts/canvas.js
 *
 * https://github.com/williamngan/react-pts-canvas/blob/master/src/index.tsx
 * react-pts-canvas - Copyright © 2019-current William Ngan and contributors.
 * Licensed under Apache 2.0 License.
 * See https://github.com/williamngan/react-pts-canvas for details.
 */

import { useCallback, useEffect, useRef } from "preact/hooks"
import { useObserver } from "preact-intersection-observer"
import { CanvasSpace, Bound, CanvasForm, Group, Create, Pt, Line, Polygon } from "pts"
import { getRandomNumber } from "@utils/primitives"

interface MyPt extends Pt {
  opacity?: number
  size?: number
}
let colors = ["#FF3F8E", "#04C2C9", "#2E55C1"]

const FloatySpaceCanvas = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spaceRef = useRef<CanvasSpace>()
  const points = useRef<Group>()
  const base_line = useRef<Group>()
  const [containerRef, inView] = useObserver<HTMLDivElement>({
    defaultInView: true,
    threshold: 0.2,
  })

  const speed = 0.0014
  const triggerDistance = 50
  const ptSize = 1.5
  const ptSizeMax = 6
  const ptOpacity = 0.1
  const ptOpacityMax = 0.3

  const handleStart = useCallback(
    (bound: Bound, space: CanvasSpace, form: CanvasForm) => {
      points.current = Create.distributeRandom(
        space.innerBound,
        Math.min((window.innerWidth * 0.05) | 0, 150)
      )
      points.current.forEach((pt: MyPt) => {
        pt.opacity = ptOpacity
        pt.size = ptSize
      })

      base_line.current = (() => {
        // set orientation
        switch (getRandomNumber(0, 4) | 0) {
          case 1:
            // top right
            return new Group(new Pt(space.size.x, 0), new Pt(0, -space.width * 0.5))
          case 2:
            // top center
            return new Group(new Pt(), new Pt(space.size.x, 0))
          default:
            // top left
            return new Group(new Pt(), new Pt(space.size.x, -space.width * 0.5))
        }
      })()
    },
    [points]
  )

  const perpend = useCallback(
    (pt: MyPt) => {
      return base_line.current!.op(Line.perpendicularFromPt)(pt)
    },
    [base_line]
  )

  const handleAnimate = useCallback(
    (space: CanvasSpace, form: CanvasForm, time: number, ftime: number) => {
      points.current!.rotate2D(speed, space.center)

      points.current!.forEach((pt: MyPt, i) => {
        try {
          const lp = perpend(pt)

          const distLineToMouse = Line.perpendicularFromPt([pt, lp], space.pointer)
            .$subtract(space.pointer)
            .magnitude()

          if (distLineToMouse < triggerDistance) {
            if (pt.opacity! < ptOpacityMax) pt.opacity! += 0.02
          } else {
            if (pt.opacity! > ptOpacity) pt.opacity! -= 0.01
          }

          const distPointToMouse = pt.$subtract(space.pointer).magnitude()
          if (distPointToMouse < triggerDistance) {
            if (pt.size! < ptSizeMax) pt.size! += 0.5
          } else {
            if (pt.size! > ptSize) pt.size! -= 0.05
          }

          form.stroke(`rgba(255,255,255,${pt.opacity}`).line([pt, lp])
          // form.fillOnly(colors[i % 3]).point(pt, pt.size /* pt.size */, "circle")
          form
            .fillOnly(colors[i % 3])
            .polygon(Polygon.fromCenter(pt, pt.size!, Math.max(3, i % 6)))
        } catch (e) {
          console.error(e)
        }
      })
    },
    [points]
  )

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return
    spaceRef.current = new CanvasSpace(canvasRef.current).setup({
      bgcolor: "#111827",
      resize: true,
      retina: true,
    })
    let form = spaceRef.current.getForm()
    spaceRef.current.add({
      start: (bound: Bound) => handleStart(bound, spaceRef.current!, form),
      animate: (time, ftime) => handleAnimate(spaceRef.current!, form, time!, ftime!),
    })
    spaceRef.current.bindMouse()

    return () => {
      spaceRef.current && spaceRef.current.dispose()
    }
  }, [canvasRef])

  /**
   * Play or stop based on play prop
   * */
  const maybePlay = () => {
    const space = spaceRef.current
    if (!space) return
    if (inView) {
      if (space.isPlaying) {
        space.resume()
      } else {
        space.replay() // if space has stopped, replay
      }
    } else {
      space.pause(true)
    }
  }

  useEffect(() => {
    maybePlay()
  })

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export default FloatySpaceCanvas