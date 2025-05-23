import {Store} from "@/store";

export interface FileInfo {
  optFileName: string
}

const FILE_INFO = "_FILE_INFO"

export class FileInfoStore extends Store<FileInfo> {
  protected data(): FileInfo {
    return {
      optFileName: '',
    }
  }
  protected key(): string {
    return FILE_INFO
  }


  public updateOptFileName(fileName: string) {
    this.state.optFileName = fileName
    this.updateState()
  }

}

const fileInfoStore = new FileInfoStore()

export {
  fileInfoStore
}