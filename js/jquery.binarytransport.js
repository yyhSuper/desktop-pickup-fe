// jQuery.binarytransport.js
$.ajaxTransport("+binary", function(options, originalOptions, jqXHR) {
    // Check for conditions and support for binary transport
    if (window.FormData && (options.dataType && (options.dataType == 'binary'))) {
        return {
            // The transport function
            send: function(headers, callback) {
                // Setup all variables
                var xhr = new XMLHttpRequest(),
                    url = options.url,
                    type = options.type,
                    async = options.async || true,
                    // blob or arraybuffer. Default is blob
                    dataType = options.responseType || "blob",
                    data = options.data || null;

                xhr.addEventListener('load', function() {
                    var data = {};
                    data[options.dataType] = xhr.response;
                    // Make sure that the callback is invoked upon successful completion
                    callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                });

                xhr.open(type, url, async);
                xhr.responseType = dataType;

                // Apply custom fields if provided
                if (options.xhrFields) {
                    for (var i in options.xhrFields) {
                        xhr[i] = options.xhrFields[i];
                    }
                }

                // Override mime type if needed
                if (options.mimeType && xhr.overrideMimeType) {
                    xhr.overrideMimeType(options.mimeType);
                }

                // Set headers
                for (var i in headers) {
                    xhr.setRequestHeader(i, headers[i]);
                }

                // Finally send data
                xhr.send(data);
            },
            abort: function() {
                jqXHR.abort();
            }
        };
    }
});
