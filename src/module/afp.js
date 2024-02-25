export function fp (page) {
    page.evaluateOnNewDocument(() => {
  
      // Canvas Def
      const toBlob = HTMLCanvasElement.prototype.toBlob;
      const toDataURL = HTMLCanvasElement.prototype.toDataURL;
      const getImageData = CanvasRenderingContext2D.prototype.getImageData;
      //
      const noisify = function (canvas, context) {
        const shift = {
          r: Math.floor(Math.random() * 10) - 5,
          g: Math.floor(Math.random() * 10) - 5,
          b: Math.floor(Math.random() * 10) - 5,
          a: Math.floor(Math.random() * 10) - 5,
        };
        //
        const width = canvas.width,
          height = canvas.height;
        const imageData = getImageData.apply(context, [0, 0, width, height]);
        for (let i = 0; i < height; i++)
          for (let j = 0; j < width; j++) {
            const n = i * (width * 4) + j * 4;
            imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
            imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
            imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
            imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
          }
  
        //
        context.putImageData(imageData, 0, 0);
      };
      //
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function () {
          noisify(this, this.getContext('2d'));
          return toBlob.apply(this, arguments);
        },
      });
      //
      Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
        value: function () {
          noisify(this, this.getContext('2d'));
          return toDataURL.apply(this, arguments);
        },
      });
      //
      Object.defineProperty(
        CanvasRenderingContext2D.prototype,
        'getImageData',
        {
          value: function () {
            noisify(this.canvas, this);
            return getImageData.apply(this, arguments);
          },
        }
      );
      //Webgl def
      const config = {
        random: {
          value: function () {
            return Math.random();
          },
          item: function (e) {
            const rand = e.length * config.random.value();
            return e[Math.floor(rand)];
          },
          array: function (e) {
            const rand = config.random.item(e);
            return new Int32Array([rand, rand]);
          },
          items: function (e, n) {
            let length = e.length;
            const result = new Array(n);
            const taken = new Array(length);
            if (n > length) n = length;
            //
            while (n--) {
              const i = Math.floor(config.random.value() * length);
              result[n] = e[i in taken ? taken[i] : i];
              taken[i] = --length in taken ? taken[length] : length;
            }
            //
            return result;
          },
        },
        spoof: {
          webgl: {
            buffer: function (target) {
              const bufferData = target.prototype.bufferData;
              Object.defineProperty(target.prototype, 'bufferData', {
                value: function () {
                  const index = Math.floor(config.random.value() * 10);
                  const noise = 0.1 * config.random.value() * arguments[1][index];
                  arguments[1][index] = arguments[1][index] + noise;
                  //
                  return bufferData.apply(this, arguments);
                },
              });
            },
            parameter: function (target) {
              const getParameter = target.prototype.getParameter;
              Object.defineProperty(target.prototype, 'getParameter', {
                value: function () {
                  const float32array = new Float32Array([1, 8192]);
                  //
                  if (arguments[0] === 3415) return 0;
                  else if (arguments[0] === 3414) return 24;
                  else if (arguments[0] === 35661)
                    return config.random.items([128, 192, 256]);
                  else if (arguments[0] === 3386)
                    return config.random.array([8192, 16384, 32768]);
                  else if (arguments[0] === 36349 || arguments[0] === 36347)
                    return config.random.item([4096, 8192]);
                  else if (arguments[0] === 34047 || arguments[0] === 34921)
                    return config.random.items([2, 4, 8, 16]);
                  else if (
                    arguments[0] === 7937 || arguments[0] === 33901 || arguments[0] === 33902
                  )
                    return float32array;
                  else if (
                    arguments[0] === 34930 || arguments[0] === 36348 || arguments[0] === 35660
                  )
                    return config.random.item([16, 32, 64]);
                  else if (
                    arguments[0] === 34076 || arguments[0] === 34024 || arguments[0] === 3379
                  )
                    return config.random.item([16384, 32768]);
                  else if (
                    arguments[0] === 3413 || arguments[0] === 3412 || arguments[0] === 3411 || arguments[0] === 3410 || arguments[0] === 34852
                  )
                    return config.random.item([2, 4, 8, 16]);
                  else
                    return config.random.item([
                      0,
                      2,
                      4,
                      8,
                      16,
                      32,
                      64,
                      128,
                      256,
                      512,
                      1024,
                      2048,
                      4096,
                    ]);
                  //
                  return getParameter.apply(this, arguments);
                },
              });
            },
          },
        },
      };
      //
      config.spoof.webgl.buffer(WebGLRenderingContext);
      config.spoof.webgl.buffer(WebGL2RenderingContext);
      config.spoof.webgl.parameter(WebGLRenderingContext);
      config.spoof.webgl.parameter(WebGL2RenderingContext);
      // Font def
      const rand = {
        noise: function () {
          const SIGN = Math.random() < Math.random() ? -1 : 1;
          return Math.floor(Math.random() + SIGN * Math.random());
        },
        sign: function () {
          const tmp = [-1, -1, -1, -1, -1, -1, +1, -1, -1, -1];
          const index = Math.floor(Math.random() * tmp.length);
          return tmp[index];
        },
      };
      //
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get() {
          const height = Math.floor(this.getBoundingClientRect().height);
          const valid = height && rand.sign() === 1;
          const result = valid ? height + rand.noise() : height;
          //
          return result;
        },
      });
      //
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        get() {
          const width = Math.floor(this.getBoundingClientRect().width);
          const valid = width && rand.sign() === 1;
          const result = valid ? width + rand.noise() : width;
          //
          return result;
        },
      });
      //Aud def
      const context = {
        BUFFER: null,
        getChannelData: function (e) {
          const getChannelData = e.prototype.getChannelData;
          Object.defineProperty(e.prototype, 'getChannelData', {
            value: function () {
              const results_1 = getChannelData.apply(this, arguments);
              if (context.BUFFER !== results_1) {
                context.BUFFER = results_1;
                for (let i = 0; i < results_1.length; i += 100) {
                  const index = Math.floor(Math.random() * i);
                  results_1[index] = results_1[index] + Math.random() * 0.0000001;
                }
              }
              //
              return results_1;
            },
          });
        },
        createAnalyser: function (e) {
          const createAnalyser = e.prototype.__proto__.createAnalyser;
          Object.defineProperty(e.prototype.__proto__, 'createAnalyser', {
            value: function () {
              const results_2 = createAnalyser.apply(this, arguments);
              const getFloatFrequencyData = results_2.__proto__.getFloatFrequencyData;
              Object.defineProperty(
                results_2.__proto__,
                'getFloatFrequencyData',
                {
                  value: function () {
                    const results_3 = getFloatFrequencyData.apply(
                      this,
                      arguments
                    );
                    for (let i = 0; i < arguments[0].length; i += 100) {
                      const index = Math.floor(Math.random() * i);
                      arguments[0][index] = arguments[0][index] + Math.random() * 0.1;
                    }
                    //
                    return results_3;
                  },
                }
              );
              //
              return results_2;
            },
          });
        },
      };
      //
      context.getChannelData(AudioBuffer);
      context.createAnalyser(AudioContext);
      context.getChannelData(OfflineAudioContext);
      context.createAnalyser(OfflineAudioContext);
      // Web RTC
      navigator.mediaDevices.getUserMedia = navigator.webkitGetUserMedia = navigator.mozGetUserMedia = navigator.getUserMedia = webkitRTCPeerConnection = RTCPeerConnection = MediaStreamTrack = undefined;
  
      // update the plugins
  
  
  
      if (window.performance) 
        window.performance.memory = {
          jsHeapSizeLimit: Math.floor(Math.random() * 1000000000) + 900000000,
          totalJSHeapSize: Math.floor(Math.random() * 800000000) + 100000000,
          usedJSHeapSize: Math.floor(Math.random() * 700000000) + 100000000,
        };
      
      Object.defineProperty(navigator, 'deviceMemory', {get: () => Math.floor(Math.random() * 8) + 4, });
  
  
    //   Object.defineProperty(navigator, 'userAgent', {get: () => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'});
  
  
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        // UNMASKED_VENDOR_WEBGL
        if (parameter === 37445) 
          return 'Intel Open Source Technology Center';
        
        // UNMASKED_RENDERER_WEBGL
        if (parameter === 37446) 
          return 'Mesa DRI Intel(R) Ivybridge Mobile ';
        
  
        return getParameter.call(this, parameter);
      };
      
      // @ts-ignore
      window.chrome = {runtime: {}, };
  
      window.navigator.chrome = {
        runtime: {},
        // etc.
      };
      const newProto = navigator.__proto__;
      delete newProto.webdriver;
      navigator.__proto__ = newProto;
  
    });
    return page;
  };