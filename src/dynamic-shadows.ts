import {
  Scene,
  Light,
  ShadowGenerator,
  DirectionalLight,
  SpotLight,
  PointLight,
} from '@babylonjs/core'

const shadowGenerators = new Map<Light, ShadowGenerator>()

export function initializeDynamicShadows(scene: Scene): void {
  // --- Light Observables ---

  scene.onNewLightAddedObservable.add((newLight) => {
    if (!newLight.name.includes('_noshadow')) {
      if (
        newLight instanceof DirectionalLight ||
        newLight instanceof SpotLight ||
        newLight instanceof PointLight
      ) {
        const shadowGenerator = new ShadowGenerator(1024, newLight)
        shadowGenerator.usePercentageCloserFiltering = true
        shadowGenerator.frustumEdgeFalloff = 1
        shadowGenerators.set(newLight, shadowGenerator)
        console.log(`Shadow generator created for light: ${newLight.name}`)

        // Add existing eligible meshes as shadow casters for this new light
        scene.meshes.forEach((mesh) => {
          if (
            !mesh.name.includes('_nocast') &&
            !mesh.name.includes('_transparent')
          ) {
            shadowGenerator.addShadowCaster(mesh)
          }
          if (!mesh.name.includes('_noshadow')) {
            mesh.receiveShadows = true
          }
        })
      } else {
        console.warn(
          `Light "${newLight.name}" is not a supported type for shadow generation.`
        )
      }
    }
  })

  scene.onLightRemovedObservable.add((removedLight) => {
    if (shadowGenerators.has(removedLight)) {
      const shadowGeneratorToRemove = shadowGenerators.get(removedLight)
      shadowGeneratorToRemove?.dispose()
      shadowGenerators.delete(removedLight)
      console.log(`Shadow generator removed for light: ${removedLight.name}`)
    }
  })

  // Initial pass for existing lights
  scene.lights.forEach((existingLight) => {
    if (!existingLight.name.includes('_noshadow')) {
      if (
        existingLight instanceof DirectionalLight ||
        existingLight instanceof SpotLight ||
        (existingLight instanceof PointLight &&
          !shadowGenerators.has(existingLight))
      ) {
        const shadowGenerator = new ShadowGenerator(1024, existingLight)
        shadowGenerator.usePercentageCloserFiltering = true
        shadowGenerator.frustumEdgeFalloff = 1
        shadowGenerators.set(existingLight, shadowGenerator)
        console.log(
          `Shadow generator created for existing light: ${existingLight.name}`
        )

        // Add existing eligible meshes as shadow casters for this light
        scene.meshes.forEach((mesh) => {
          if (
            !mesh.name.includes('_nocast') &&
            !mesh.name.includes('_transparent')
          ) {
            shadowGenerator.addShadowCaster(mesh)
          }
          if (!mesh.name.includes('_noshadow')) {
            mesh.receiveShadows = true
          }
        })
      } else if (
        !(existingLight instanceof DirectionalLight) &&
        !(existingLight instanceof SpotLight) &&
        !(existingLight instanceof PointLight)
      ) {
        console.warn(
          `Light "${existingLight.name}" is not a supported type for shadow generation.`
        )
      }
    }
  })

  // --- Mesh Observables ---

  scene.onNewMeshAddedObservable.add((newMesh) => {
    // Add as shadow caster to all existing shadow generators if name criteria are met
    if (
      !newMesh.name.includes('_nocast') &&
      !newMesh.name.includes('_transparent')
    ) {
      shadowGenerators.forEach((shadowGenerator) => {
        shadowGenerator.addShadowCaster(newMesh)
      })
      console.log(`Mesh added as shadow caster: ${newMesh.name}`)
    }

    // Set to receive shadows if name criteria are met
    if (!newMesh.name.includes('_noshadow')) {
      newMesh.receiveShadows = true
      console.log(`Mesh set to receive shadows: ${newMesh.name}`)
    }
  })

  scene.onMeshRemovedObservable.add((removedMesh) => {
    // Remove as shadow caster from all existing shadow generators
    shadowGenerators.forEach((shadowGenerator) => {
      shadowGenerator.removeShadowCaster(removedMesh)
    })
    console.log(`Mesh removed as shadow caster: ${removedMesh.name}`)
    removedMesh.receiveShadows = false // Clean up receiveShadows flag
  })

  // Initial pass for existing meshes
  scene.meshes.forEach((existingMesh) => {
    if (!existingMesh.name.includes('_noshadow')) {
      existingMesh.receiveShadows = true
      console.log(`Existing mesh set to receive shadows: ${existingMesh.name}`)
    }
    if (
      !existingMesh.name.includes('_nocast') &&
      !existingMesh.name.includes('_transparent')
    ) {
      shadowGenerators.forEach((shadowGenerator) => {
        shadowGenerator.addShadowCaster(existingMesh)
      })
      console.log(`Existing mesh added as shadow caster: ${existingMesh.name}`)
    }
  })
}

// Example usage:
// const scene = new Scene(engine);
// initializeDynamicShadows(scene);
//
// // Later, when you add a new mesh:
// const castingBox = MeshBuilder.CreateBox("castingBox", { size: 1 }, scene);
// const receivingPlane = MeshBuilder.CreatePlane("receivingPlane", { size: 5 }, scene);
// receivingPlane.rotation.x = Math.PI / 2;
// receivingPlane.position.y = -0.5;
//
// const noCastSphere = MeshBuilder.CreateSphere("noCast_sphere", { diameter: 0.5 }, scene);
// const noShadowGround = MeshBuilder.CreatePlane("noShadow_ground", { size: 5 }, scene);
// noShadowGround.rotation.x = Math.PI / 2;
// noShadowGround.position.y = -1;
