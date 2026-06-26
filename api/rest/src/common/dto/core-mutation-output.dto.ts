// common/dto/core-mutation-output.dto.ts
export class CoreMutationOutput {
  message: string;
  success: boolean;
}

export class CoreResponse extends CoreMutationOutput {}