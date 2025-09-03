import React from 'react';

export interface MediaUpload {
  dataUrl: string;
  file: File;
}

// This component is no longer used visually. It's kept for the MediaUpload type export
// to simplify the update process and avoid breaking imports in other components.
export const UploadActionSheet: React.FC<any> = () => {
  return null;
};
