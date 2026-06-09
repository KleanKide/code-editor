import { Injectable } from '@nestjs/common';
import * as Y from 'yjs';

@Injectable()
export class CollaborationService {
  private readonly docs = new Map<string, Y.Doc>();

  getDoc(projectId: string) {
    let doc = this.docs.get(projectId);

    if (!doc) {
      doc = new Y.Doc();
      this.docs.set(projectId, doc);
    }

    return doc;
  }

  getText(projectId: string) {
    return this.getDoc(projectId).getText('monaco');
  }

  getState(projectId: string) {
    return Y.encodeStateAsUpdate(this.getDoc(projectId));
  }

  applyUpdate(projectId: string, update: Uint8Array) {
    Y.applyUpdate(this.getDoc(projectId), update);
  }
}
