import { EntityId } from '@reduxjs/toolkit';

// Mở rộng các interface của Redux Toolkit để hỗ trợ MongoDB _id
declare module '@reduxjs/toolkit' {
  interface EntityAdapter<T> {
    selectId?: (entity: T) => EntityId;
  }

  interface EntityState<T> {
    ids: EntityId[];
    entities: {
      [id: string]: T;
    };
  }
}

// Định nghĩa MongoDocument interface cho các model MongoDB
export interface MongoDocument {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Export một kiểu tiện lợi cho entity adapter với MongoDB
export type MongoEntityState<T extends MongoDocument> = {
  ids: string[];
  entities: {
    [id: string]: T;
  };
}; 