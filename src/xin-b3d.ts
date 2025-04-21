import { XinBlueprint, PartsMap } from 'xinjs'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/gui'
import '@babylonjs/loaders'

type B3dCallback =
  | ((element: HTMLElement, BABYLON: any) => void)
  | ((element: HTMLElement, BABYLON: any) => Promise<void>)

interface B3dUIOptions {
  snippetId?: string
  jsonUrl?: string
  data?: any
  size?: number
}

const noop = () => {
  /* do not care */
}

const scriptMap: { [key: string]: Promise<any> } = {}
const scriptTag = (url: string, name: string): Promise<any> => {
  if (!scriptMap[url]) {
    scriptMap[url] = new Promise((resolve) => {
      const script = document.createElement('script')
      script.setAttribute('src', url)
      script.onload = () => {
        // @ts-expect-error do not care
        resolve(window[name])
      }
      document.head.append(script)
    })
  }
  return scriptMap[url]
}

interface B3dParts extends PartsMap {
  canvas: HTMLCanvasElement
}

export const b3d: XinBlueprint<B3dParts> = (tag, factory) => {
  const { Component, elements, vars } = factory

  class B3d extends Component<B3dParts> {
    static styleSpec = {
      ':host': {
        display: 'block',
        position: 'relative',
      },
      ':host canvas': {
        width: '100%',
        height: '100%',
      },
      ':host .babylonVRicon': {
        height: 50,
        width: 80,
        backgroundColor: 'transparent',
        filter: 'drop-shadow(0 0 4px #000c)',
        // backgroundImage: svg2DataUrl(icons.xr(), '#fffd'),
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: 'none',
        borderRadius: 5,
        borderStyle: 'none',
        outline: 'none',
        transition: 'transform 0.125s ease-out',
      },
      ':host .babylonVRicon:hover': {
        transform: 'scale(1.1)',
      },
    }

    content = [elements.canvas({ part: 'canvas' }), elements.slot()]

    constructor() {
      super()
    }

    scene: any
    engine: any

    sceneCreated: B3dCallback = noop
    update: B3dCallback = noop

    private _update = () => {
      if (this.scene) {
        if (this.update !== undefined) {
          this.update(this, this.BABYLON)
        }
        if (this.scene.activeCamera !== undefined) {
          this.scene.render()
        }
      }
    }

    onResize() {
      if (this.engine) {
        this.engine.resize()
      }
    }

    loadScene = async (
      path: string,
      file: string,
      processCallback = (scene: any) => {
        console.log(scene, 'loaded')
      }
    ): Promise<void> => {
      BABYLON.SceneLoader.Append(path, file, this.scene, processCallback)
    }

    loadUI = async (options: B3dUIOptions): Promise<any> => {
      const BABYLON = await scriptTag(
        'https://cdn.babylonjs.com/gui/babylon.gui.min.js',
        'BABYLON'
      )
      const advancedTexture =
        BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
          'GUI',
          true,
          this.scene
        )
      const { snippetId, jsonUrl, data, size } = options
      if (size) {
        advancedTexture.idealWidth = size
        advancedTexture.renderAtIdealSize = true
      }
      // edit or create your own snippet here
      // https://gui.babylonjs.com/
      let gui
      if (snippetId) {
        gui = await advancedTexture.parseFromSnippetAsync(snippetId)
      } else if (jsonUrl) {
        gui = await advancedTexture.parseFromURLAsync(jsonUrl)
      } else if (data) {
        gui = advancedTexture.parseContent(data)
      } else {
        return null
      }

      const root = advancedTexture.getChildren()[0]
      const widgets = root.children.reduce(
        (map: { [key: string]: any }, widget: any) => {
          map[widget.name] = widget
          return map
        },
        {}
      )

      return { advancedTexture, gui, root, widgets }
    }

    private load = async () => {
      const { canvas } = this.parts
      this.engine = new BABYLON.Engine(canvas, true)
      this.scene = new BABYLON.Scene(this.engine)
      if (this.sceneCreated) {
        await this.sceneCreated(this, BABYLON)
      }
      if (this.scene.activeCamera === undefined) {
        const camera = new BABYLON.ArcRotateCamera(
          'default-camera',
          -Math.PI / 2,
          Math.PI / 2.5,
          3,
          new BABYLON.Vector3(0, 0, 0)
        )
        camera.attachControl(this.parts.canvas, true)
      }
      this.engine.runRenderLoop(this._update)
    }

    connectedCallback(): void {
      super.connectedCallback()

      this.load()
    }
  }

  return {
    type: B3d,
    styleSpec: {
      ':root': {
        _toggleTrackColor: 'lightgray',
        _toggleTrackOnColor: vars.toggleTrackColor,
        _toggleOffColor: 'gray',
        _toggleOnColor: 'limegreen',
        _toggleKnobSize: '24px',
        _toggleKnobRadius: vars.toggleKnobSize50,
        _toggleTransition: 'ease-in-out 0.2s',
        _toggleTrackWidth: '32px',
        _toggleTrackInset: '8px',
        _toggleTrackHeight: `calc(${vars.toggleKnobSize} - ${vars.toggleTrackInset200})`,
        _toggleTrackRadius: vars.toggleTrackHeight50,
        _toggleDisabledOpacity: '0.5',
        _toggleKnobShadow:
          'inset 0 1px 1px #fff8, inset 0 -1px 1px #0004, 0 2px 4px #0006',
        _toggleTrackShadow: 'inset 0 1px 2px #0004',
        _toggleGap: '8px',
      },
      ':host[disabled]': {
        pointerEvents: 'none',
        opacity: vars.toggleDisabledOpacity,
      },
    },
  }
}

export default b3d
