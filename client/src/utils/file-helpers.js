/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml'
];

export const MAX_IMAGES_PER_DROP = 10;

export const isImageFile = (file) => {
  return IMAGE_TYPES.includes(file.type);
};

export const getFileNameWithoutExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, '');
};

export const validateImageFiles = (files) => {
  const imageFiles = files.filter(file => isImageFile(file));
  return imageFiles.slice(0, MAX_IMAGES_PER_DROP);
};

export const processImageFiles = (files) => {
  const validFiles = validateImageFiles(files);
  
  return validFiles.map(file => ({
    file,
    name: getFileNameWithoutExtension(file.name),
    type: file.type
  }));
};
