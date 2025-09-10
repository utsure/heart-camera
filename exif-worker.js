// piexif.jsライブラリをWorkerに読み込む（最新版に更新）
importScripts('https://cdn.jsdelivr.net/npm/piexifjs@1.0.6/piexif.js');

self.onmessage = (event) => {
  const { imageUrl, position } = event.data;

  if (position && self.piexif) {
    try {
      const exifObj = {"0th": {}, "GPS": {}};
      exifObj["0th"][piexif.ImageIFD.Software] = "F-Shutter Heart Camera";
      
      // GPSデータの設定
      exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = position.coords.latitude < 0 ? 'S' : 'N';
      exifObj.GPS[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDms(position.coords.latitude);
      exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = position.coords.longitude < 0 ? 'W' : 'E';
      exifObj.GPS[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDms(position.coords.longitude);
      
      // 画像の向き（Orientation）を1 (Horizontal)に設定することで、多くのビューアで正しく表示されるようにします。
      // ただし、動画から取得した画像を反転させている場合、別途調整が必要になる可能性があります。
      // 今回はvideo.style.transformで対応しているため、EXIFのOrientationはデフォルト(1)でよいはず。
      // exifObj["0th"][piexif.ImageIFD.Orientation] = 1; 

      const exifBytes = piexif.dump(exifObj);
      const newImageUrl = piexif.insert(exifBytes, imageUrl);
      
      // 成功したら、EXIF付きの画像データをメインスレッドに返す
      self.postMessage(newImageUrl);

    } catch (error) {
      console.error("EXIF Worker Error: Failed to insert EXIF data", error);
      // EXIF書き込み失敗しても、元の画像データをそのまま返す
      self.postMessage(imageUrl);
    }
  } else {
    // 位置情報がない場合は、元の画像データをそのまま返す
    self.postMessage(imageUrl);
  }
};
