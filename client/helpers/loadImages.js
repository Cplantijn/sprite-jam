export default async function(imagePaths) {
  return await Promise.all(imagePaths.map(imagePath => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = imagePath;

      img.addEventListener('load', () => {
        return resolve();
      });
    });
  }))
}