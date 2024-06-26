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
import { CanvasSpace, Bound, CanvasForm, Group, Pt, Line, Polygon, Geom } from "pts"
import { getRandomNumber } from "@utils/primitives"
import { Create as DefaultCreate } from "pts"
interface MyPt extends Pt {
  opacity?: number
  size?: number
}
let colors = ["#FF3F8E", "#04C2C9", "#2E55C1", "#FFA400"]

class Create extends DefaultCreate {
  static distributeRandomRadial(center: Pt, radius: number, count: number): Group {
    let pts = new Group()
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * radius
      const t = Math.random() * Math.PI * 2
      pts.push(center.$add(Math.cos(t) * r, Math.sin(t) * r))
    }
    return pts
  }
}

const FloatySpaceCanvas = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spaceRef = useRef<CanvasSpace>()
  const points = useRef<Group>()
  const orientation = useRef(getRandomNumber(0, 4))
  const base_line = useRef<Group>()
  const [containerRef, inView] = useObserver<HTMLDivElement>({
    defaultInView: true,
    threshold: 0.2,
  })

  const rotateAngle = 0.0014
  const triggerDistance = 50
  const ptSize = 1.5
  const ptSizeMax = 9
  const ptOpacity = 0.07
  const ptOpacityMax = 0.25

  const setBaseLine = useCallback((space: CanvasSpace) => {
    base_line.current = (() => {
      // set orientation
      switch (orientation.current) {
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
  }, [])

  const handleStart = useCallback(
    (bound: Bound, space: CanvasSpace, form: CanvasForm) => {
      points.current = Create.distributeRandomRadial(
        space.innerBound.center,
        space.size.maxValue().value / 2,
        Math.min((window.innerWidth * 0.07) | 0, 150),
      )
      points.current.forEach((pt: MyPt) => {
        pt.opacity = ptOpacity
        pt.size = ptSize
      })

      setBaseLine(space)
    },
    [points],
  )

  const perpend = useCallback(
    (pt: MyPt) => {
      return base_line.current!.op(Line.perpendicularFromPt)(pt)
    },
    [base_line],
  )

  const handleAnimate = useCallback(
    (space: CanvasSpace, form: CanvasForm) => {
      const pointer = space.pointer
      points.current!.forEach((pt: MyPt, i) => {
        Geom.rotate2D(pt, rotateAngle, space.center)
        const lp = [pt, perpend(pt)]

        const distLineToMouse = Line.perpendicularFromPt(lp, pointer)
          .$subtract(pointer)
          .magnitude()

        if (distLineToMouse < triggerDistance && pt.opacity! < ptOpacityMax) {
          pt.opacity! += 0.02
        } else if (pt.opacity! > ptOpacity) {
          pt.opacity! -= 0.01
        }

        const distPointToMouse = pt.$subtract(pointer).magnitude()
        if (distPointToMouse < triggerDistance && pt.size! < ptSizeMax) {
          pt.size! += 0.25
        } else if (pt.size! > ptSize) {
          pt.size! -= 0.1
        }

        form.strokeOnly(`rgb(255 255 255 / ${pt.opacity}`).line(lp)
        form
          .fillOnly(colors[i % 4])
          .polygon(Polygon.fromCenter(pt, pt.size!, Math.max(3, i % 6)))
      })
    },
    [points],
  )

  useEffect(() => {
    if (!canvasRef?.current) {
      return
    }
    const space = new CanvasSpace(canvasRef.current).setup({
      bgcolor: "#111827",
      resize: true,
      retina: true,
    })
    let form = space.getForm()
    space
      .add({
        start: (bound: Bound) => handleStart(bound, space, form),
        animate: () => handleAnimate(space, form),
        resize: () => setBaseLine(space),
      })
      .bindMouse(true)
      .bindTouch(true, true)
    spaceRef.current = space

    return () => {
      space && space.dispose()
    }
  }, [canvasRef])

  /**
   * Play or stop based on play prop
   * */
  const maybePlay = () => {
    const space = spaceRef.current
    if (!space) {
      return
    }
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
