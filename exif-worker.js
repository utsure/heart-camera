// piexif.jsライブラリをWorkerに読み込む
importScripts('https://cdn.jsdelivr.net/npm/piexifjs/piexif.js');

self.onmessage = (event) => {
  const { imageUrl, position } = event.data;

  if (position && self.piexif) {
    try {
      const exifObj = {"0th": {}, "GPS": {}};
      exifObj["0th"][piexif.ImageIFD.Software] = "F-Shutter Heart Camera";
      
      exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = position.coords.latitude < 0 ? 'S' : 'N';
      exifObj.GPS[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDms(position.coords.latitude);
      exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = position.coords.longitude < 0 ? 'W' : 'E';
      exifObj.GPS[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDms(position.coords.longitude);
      
      const exifBytes = piexif.dump(exifObj);
      const newImageUrl = piexif.insert(exifBytes, imageUrl);
      
      // 成功したら、EXIF付きの画像データをメインスレッドに返す
      self.postMessage(newImageUrl);

    } catch (error) {
      console.error("EXIF Worker Error:", error);
      // 失敗したら、元の画像データをそのまま返す
      self.postMessage(imageUrl);
    }
  } else {
    // 位置情報がない場合は、元の画像データをそのまま返す
    self.postMessage(imageUrl);
  }
};
