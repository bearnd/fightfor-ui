enum DescriptorClass {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

export interface DescriptorInterface {
  descriptorId?: number;
  class?: DescriptorClass;
  ui: string;
  name?: string;
  created?: Date;
  revised?: Date;
  established?: Date;
  annotation?: string;
  historyNote?: string;
  nlmClassificationNumber?: string;
  onlineNote?: string;
  publicMeshNote?: string;
  considerAlso?: string;
}
