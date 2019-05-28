# preview-generator

![screenshot about the preview generator](http://shadowvzs.uw.hu/git/images/preview_generator.jpg)

#### Description:
- extract thumbnail from video file/images without uploading the files 

### Pro & Contra

#### Feature:
* easy configuration (minimal settings just 1 row, everything else is optional)
* no lib dependency
* lightweight
* fast (depend on your configuration)
* custumoziable thumbnail rendering
* easy filter on files
* work with multiple files and container

#### Limitations:
* video file format must be **.mp4**
* work only with modern browsers (firefox, chrome, opera, edge etc)


### Config

#### Minimal Example:
```javascript
    const config = {
        selector: 'input[type="file"]'
    }
```

#### Advanced Example:
```javascript
    const config = {
        mode: 'async',
        selector: 'input[type="file"]',
        container: '#thumbnail-container',
        base64: true,
        filter: (file) => file.size < 2097152,
        segment: d => d / 2,
        limit: 5,
        sort: (file1, file2) => file1.size < file2.size,
        compression: ['jpeg', 0.75],
        render: (image, file) => {
            const div = document.createElement('div');
            div.innerHTML = `filename: ${file.name} - type: ${file.type} <div>${image.outerHTML}</div>`;
            return div;
        }
    }
```

* **selector** - value is string (dom element selector)
  * used for grab 1 or more input field and attach onchange event to it/them

* **mode** - value is string ('async' or 'sync', default is *'async'*)
  * *async*: way usefull if multiple files loaded with input then each promise solved in same time. *(Promise.all)*
  * *sync*: each promise resolved after eachother

* **container** - value is string (dom element selector)
  * if your container is a 1 fixed dom element then you can use this property

* **limit** - value is number
  * limit the files list size, example: if 1 then even if you select 20 image but we take only the first

* **sort** - value is function (params: file1 and file2)
  * you can sort the array based on *file type/size* or *name*

* **base64** - value is boolean (default is *false*)
  * applied only for images, recommanded if you want create string template in *render* function
  * drastically decrease the preview generation speed (1-10ms => 100-200ms) so best if you use it with input with single file
  * if you don't care about string template then use *false* and use the image node

* **compression** - value is array (used for video thumbnails and if base64 is true then to images too):
            * extension: 'png', 'jpeg' or 'webp' (recommended is jpeg and that is the default)
            * quality: is number between 0 - 1 (1 is 100%), default is 0.75 so 75% quality
  * for inputs with single file you can use any format and quality but if you use multiple option then recommended is jpeg and 0.5 - 0.75

* **filter** - value is function (param is *file* object)
  * used for filter the files, in function the argument is the *file* and you have access to *file size/type/name*

* **segment** - value is function or number (param is video duration - default is 1)
  * which video segment you want use for thumbnail:
         - *number*: you can use fixed number (example if 1 then thumbnail will be created when movie is at 00:00:01 sec)
         - *function*: argument is the video duration (number) so you can calculate segment with that (example: d => d / 4 then image created at 25%)

* **render** - value is function (params: image node, file object):
  * in this function you can customize how do you want add a new image into container, you can use image node or string template
  * *string template*:
```javascript
        render: (image, file) => {
            const thumbnail = document.createElement('div');
            thumbnail.innerHTML = `filename: ${file.name} - type: ${file.type} ${image.outerHTML}`;
            return thumbnail;
        }
```

  * *node template*:
```javascript
        render: (image, file) => {
            const thumbnail = document.createElement('div');
            const text = document.createElement('span');
            text.textContent = file.name;
            thumbnail.append(image);
            thumbnail.append(text);
            return thumbnail;
        }
```
  
