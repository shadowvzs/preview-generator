class PreviewGenerator {
    constructor(config) {
        this.onChange = this.onChange.bind(this);
        this._config = config;
        if (config.selector) { this.addInputEvent(config.selector); }
    }

    addInputEvent(selector) {
        if (!selector) { return console.error('Please provide a valid DOM selector (ex.: ".my-input" )'); }
        const inputs = document.querySelectorAll(selector);
        if (!selector.length) { return console.error('We did not found any input with this selector string!') ;}
        this._inputs = inputs;
        inputs.forEach(e => e.onchange = this.onChange)
    }

    onChange(event) {
        const container = event.target.dataset.container || this._config.container;
        this.generatePreview(Array.from(event.target.files), container);
    }

    async generatePreview(files = [], container) {
        if (typeof files === 'object' && !Array.isArray(files)) {
            files = Array.from(files);
        }
        if (!files || !files.length) { return console.error('Need a valid/non empty files object, but we got this ', files); }

        const { mode, filter } = this._config;
        if (typeof filter === 'function') {
            files = files.filter(file => filter(file));
            if (!files.length) { return console.info('No remaining file after filtering...'); }
        }

        const startedAt = performance.now();
        console.clear();
        this._files = files;
        this._result = [];

        // default behavior is the async mode
        // async: parallel preview generation - faster but unordered
        // sync: will be generated 1 by 1 - slower but ordered
        if (!mode || mode === 'async') {
            this._result = await Promise.all(files.map(file => this.loadGenerator(file)));
        } else {
            for (const file of files) {
                this._result.push(await this.loadGenerator(file));
            }
        }
        this.duration = performance.now() - startedAt;

        if (container) { this.renderPreviews(container, this._result); }

        console.info(`Process was: ${this.duration}ms`);
    }

    renderPreviews(container, result) {
        const fragment = document.createDocumentFragment();
        const render = this._config.render || this.defaultRender;
        this._result.forEach(({ image, file }) => {
            if (!image) { return; }
            fragment.append(render(image, file));
        });

        const target = document.querySelector(container);

        if (target) {
            target.innerHTML = '';
            target.append(fragment);
        }
        console.info(`- ${result.length} image was appended into "${container}"`);
    }

    defaultRender(image, file) {
        return image;
    }

    // dispatch - call video or image function depend on file type
    loadGenerator(file, position = false) {
        const mime = file.type;
        if (mime.startsWith("image")) {
            return this.generateImagePreview(file);
        } else if (mime.startsWith("video")) {
            return this.generateVideoPreview(file, this._config.segment || 1);
        } else {
            Promise.resolve(undefined);
        }
    }

    // create image based on file input image
    generateImagePreview(file) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const objectUrl = URL.createObjectURL(file);
            image.onerror = reject;

            image.onload = () => {
                if (this._config.base64) {
                    image.src = this.sourceToBase64(image, image.width, image.height);
                }
                resolve({ image, file })
                URL.revokeObjectURL(objectUrl);
            };
            image.src = objectUrl;
        })
    }

    // create image based on video file
    // steps: load file in video element, change current position for video, copy to canvas, use canvas content for image source
    generateVideoPreview(file, segment) {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            const objectUrl = URL.createObjectURL(file);
            video.onerror = reject;

            video.onloadedmetadata = () => video.currentTime = typeof segment === 'function' ? segment(video.duration) : segment;

            video.ontimeupdate = () => {
                const image = new Image();
                image.onerror = reject;
                image.src = this.sourceToBase64(video, video.videoWidth, video.videoHeight);
                resolve({ image, file })
                URL.revokeObjectURL(objectUrl);
            };
            console.log(objectUrl)
            video.src = objectUrl;
        })
    }

    sourceToBase64(source, width, height) {
        const canvas = document.createElement("canvas");
        const [type = 'jpeg', quality = 0.75] = this._config.compression || [];
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(source, 0, 0, width, height);
        return canvas.toDataURL(`image/${type}`, quality);
    }
}
