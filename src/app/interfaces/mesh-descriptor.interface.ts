enum MeshDescriptorClass {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

export interface MeshDescriptorInterface {
  descriptorId?: number
  class?: MeshDescriptorClass
  ui: string
  name?: string
  created?: Date
  revised?: Date
  established?: Date
  annotation?: string
  historyNote?: string
  nlmClassificationNumber?: string
  onlineNote?: string
  publicMeshNote?: string
  considerAlso?: string
}
