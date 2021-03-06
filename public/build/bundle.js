
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    const API_KEY = "6319d22daefc4569b67122547210502";


    // Make a request for a user with a given ID
    async function currentWeatherSearchAutocomplete(
    query
    ) {
      return await axios$1
        .get(
          `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
        )
        .then(function (response) { 
          return response.data;
        })
        .catch(function (error) {
        })  
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const citys = writable([]);

    const setCitys = (arg)  =>{
            citys.set(arg);
     return citys;
    };

    const API_KEY$1 = "6319d22daefc4569b67122547210502";


    // Make a request for a user with a given ID
    async function currentWeatherDataByGeographicCoordinates(
      lat,
      long
    ) {
      return await axios$1
        .get(
          `http://api.weatherapi.com/v1/current.json?key=${API_KEY$1}&q=${lat},${long}&lang=es`
        )
        .then(function (response) { 
          return response.data;
        })
        .catch(function (error) {
         return error
        })  
    }

    const currentWeather = writable(null);

    async function setCurrentWeather(lat, long) {
      let result = await currentWeatherDataByGeographicCoordinates(lat, long);
      if (result) {
        currentWeather.set(result);
      }
      return currentWeather;
    }

    /* src/components/AutoComplete.svelte generated by Svelte v3.32.1 */
    const file = "src/components/AutoComplete.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (39:4) {#each $citys as item}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[6].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[6].name;
    			option.value = option.__value;
    			add_location(option, file, 39, 6, 1056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$citys*/ 2 && t_value !== (t_value = /*item*/ ctx[6].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*$citys*/ 2 && option_value_value !== (option_value_value = /*item*/ ctx[6].name)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:4) {#each $citys as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let input;
    	let t;
    	let datalist;
    	let mounted;
    	let dispose;
    	let each_value = /*$citys*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			input = element("input");
    			t = space();
    			datalist = element("datalist");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "list", "datalistOptions");
    			attr_dev(input, "id", "exampleDataList");
    			attr_dev(input, "placeholder", "Ingrese una ciudad");
    			add_location(input, file, 28, 2, 787);
    			attr_dev(datalist, "id", "datalistOptions");
    			add_location(datalist, file, 37, 2, 991);
    			attr_dev(main, "class", "mt-2");
    			add_location(main, file, 27, 0, 765);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input);
    			set_input_value(input, /*ciudad*/ ctx[0]);
    			append_dev(main, t);
    			append_dev(main, datalist);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(datalist, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(input, "keypress", /*search*/ ctx[2], false, false, false),
    					listen_dev(input, "input", /*handleInput*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ciudad*/ 1 && input.value !== /*ciudad*/ ctx[0]) {
    				set_input_value(input, /*ciudad*/ ctx[0]);
    			}

    			if (dirty & /*$citys*/ 2) {
    				each_value = /*$citys*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(datalist, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $citys;
    	validate_store(citys, "citys");
    	component_subscribe($$self, citys, $$value => $$invalidate(1, $citys = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AutoComplete", slots, []);
    	let ciudad = "";
    	let selectedItem;

    	const search = async () => {
    		if (ciudad.length >= 3) {
    			const result = await currentWeatherSearchAutocomplete(ciudad);

    			if (result !== undefined && result.length !== 0) {
    				setCitys(result);
    			}
    		}
    	};

    	const handleInput = async event => {
    		selectedItem = $citys.find(item => event.target.value === item.name);

    		if (selectedItem !== undefined) {
    			setCurrentWeather(selectedItem.lat, selectedItem.lon);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AutoComplete> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		ciudad = this.value;
    		$$invalidate(0, ciudad);
    	}

    	$$self.$capture_state = () => ({
    		currentWeatherSearchAutocomplete,
    		citys,
    		setCitys,
    		currentWeather,
    		setCurrentWeather,
    		ciudad,
    		selectedItem,
    		search,
    		handleInput,
    		$citys
    	});

    	$$self.$inject_state = $$props => {
    		if ("ciudad" in $$props) $$invalidate(0, ciudad = $$props.ciudad);
    		if ("selectedItem" in $$props) selectedItem = $$props.selectedItem;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ciudad, $citys, search, handleInput, input_input_handler];
    }

    class AutoComplete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AutoComplete",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const MONTH = [
      {
        name: "Enero",
      },
      {
        name: "Febrero",
      },
      {
        name: "Marzo",
      },
      {
        name: "Abril",
      },
      {
        name: "Mayo",
      },
      {
        name: "Junio",
      },
      {
        name: "Julio",
      },
      {
        name: "Agosto",
      },
      {
        name: "Septiembre",
      },
      {
        name: "Octubre",
      },
      {
        name: "Nomviembre",
      },
      {
        name: "Diciembre",
      },
    ];

    const DAYS= [
         {
            "name": "Domingo",
         },
         {
            "name": "Lunes",
         },
         {
            "name": "Martes",
         },
         {
            "name": "Miercoles",
         },
         {
            "name": "Jueves",
         },
         {
            "name": "Viernes",
         },
         {
            "name": "Sabado",
         },
    ];

    /* src/components/Card.svelte generated by Svelte v3.32.1 */
    const file$1 = "src/components/Card.svelte";

    // (21:2) {#if $currentWeather !== ""}
    function create_if_block(ctx) {
    	let div5;
    	let h1;
    	let t0;
    	let t1;
    	let h40;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let div3;
    	let div1;
    	let div0;
    	let h2;
    	let t12;
    	let t13;
    	let t14;
    	let h41;
    	let t15;
    	let t16;
    	let div2;
    	let img;
    	let img_src_value;
    	let t17;
    	let div4;
    	let span0;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let span1;
    	let t22;
    	let t23;
    	let t24;
    	let t25;
    	let span2;
    	let t26;
    	let t27;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			h1 = element("h1");
    			t0 = text(/*locationName*/ ctx[2]);
    			t1 = space();
    			h40 = element("h4");
    			t2 = text(/*dayName*/ ctx[7]);
    			t3 = space();
    			t4 = text(/*dayNumber*/ ctx[8]);
    			t5 = text(" de ");
    			t6 = text(/*month*/ ctx[9]);
    			t7 = space();
    			t8 = text(/*hours*/ ctx[10]);
    			t9 = text(":");
    			t10 = text(/*minutes*/ ctx[11]);
    			t11 = space();
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t12 = text(/*temp*/ ctx[0]);
    			t13 = text(" °");
    			t14 = space();
    			h41 = element("h4");
    			t15 = text(/*conditionText*/ ctx[1]);
    			t16 = space();
    			div2 = element("div");
    			img = element("img");
    			t17 = space();
    			div4 = element("div");
    			span0 = element("span");
    			t18 = text("Humedad ");
    			t19 = text(/*humidity*/ ctx[3]);
    			t20 = text(" %");
    			t21 = space();
    			span1 = element("span");
    			t22 = text("Viento ");
    			t23 = text(/*wind*/ ctx[4]);
    			t24 = text(" km/h");
    			t25 = space();
    			span2 = element("span");
    			t26 = text("Indice UV ");
    			t27 = text(/*uv*/ ctx[5]);
    			attr_dev(h1, "class", "title svelte-1wam5ea");
    			add_location(h1, file$1, 24, 6, 640);
    			attr_dev(h40, "class", "title svelte-1wam5ea");
    			add_location(h40, file$1, 25, 6, 684);
    			attr_dev(h2, "class", "title-temp svelte-1wam5ea");
    			add_location(h2, file$1, 29, 12, 843);
    			attr_dev(h41, "class", "title-day svelte-1wam5ea");
    			add_location(h41, file$1, 30, 12, 892);
    			add_location(div0, file$1, 28, 10, 825);
    			attr_dev(div1, "class", "item svelte-1wam5ea");
    			add_location(div1, file$1, 27, 8, 796);
    			attr_dev(img, "class", "icons svelte-1wam5ea");
    			if (img.src !== (img_src_value = "./icons/" + /*conditionTextIcon*/ ctx[6] + ".svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "atl", /*conditionTextIcon*/ ctx[6]);
    			add_location(img, file$1, 35, 10, 1060);
    			attr_dev(div2, "class", "item svelte-1wam5ea");
    			add_location(div2, file$1, 33, 8, 975);
    			attr_dev(div3, "class", "container svelte-1wam5ea");
    			add_location(div3, file$1, 26, 6, 764);
    			add_location(span0, file$1, 43, 8, 1251);
    			add_location(span1, file$1, 44, 8, 1293);
    			add_location(span2, file$1, 45, 8, 1333);
    			attr_dev(div4, "class", "info svelte-1wam5ea");
    			add_location(div4, file$1, 42, 6, 1224);
    			attr_dev(div5, "class", "card text-white shadow p-3 mb-5  rounded  mb-3 col-md-6  col-sm-8  offset-md-3 card-container background-card svelte-1wam5ea");
    			add_location(div5, file$1, 21, 4, 499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h1);
    			append_dev(h1, t0);
    			append_dev(div5, t1);
    			append_dev(div5, h40);
    			append_dev(h40, t2);
    			append_dev(h40, t3);
    			append_dev(h40, t4);
    			append_dev(h40, t5);
    			append_dev(h40, t6);
    			append_dev(h40, t7);
    			append_dev(h40, t8);
    			append_dev(h40, t9);
    			append_dev(h40, t10);
    			append_dev(div5, t11);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t12);
    			append_dev(h2, t13);
    			append_dev(div0, t14);
    			append_dev(div0, h41);
    			append_dev(h41, t15);
    			append_dev(div3, t16);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div5, t17);
    			append_dev(div5, div4);
    			append_dev(div4, span0);
    			append_dev(span0, t18);
    			append_dev(span0, t19);
    			append_dev(span0, t20);
    			append_dev(div4, t21);
    			append_dev(div4, span1);
    			append_dev(span1, t22);
    			append_dev(span1, t23);
    			append_dev(span1, t24);
    			append_dev(div4, t25);
    			append_dev(div4, span2);
    			append_dev(span2, t26);
    			append_dev(span2, t27);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*locationName*/ 4) set_data_dev(t0, /*locationName*/ ctx[2]);
    			if (dirty & /*dayName*/ 128) set_data_dev(t2, /*dayName*/ ctx[7]);
    			if (dirty & /*dayNumber*/ 256) set_data_dev(t4, /*dayNumber*/ ctx[8]);
    			if (dirty & /*month*/ 512) set_data_dev(t6, /*month*/ ctx[9]);
    			if (dirty & /*hours*/ 1024) set_data_dev(t8, /*hours*/ ctx[10]);
    			if (dirty & /*minutes*/ 2048) set_data_dev(t10, /*minutes*/ ctx[11]);
    			if (dirty & /*temp*/ 1) set_data_dev(t12, /*temp*/ ctx[0]);
    			if (dirty & /*conditionText*/ 2) set_data_dev(t15, /*conditionText*/ ctx[1]);

    			if (dirty & /*conditionTextIcon*/ 64 && img.src !== (img_src_value = "./icons/" + /*conditionTextIcon*/ ctx[6] + ".svg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*conditionTextIcon*/ 64) {
    				attr_dev(img, "atl", /*conditionTextIcon*/ ctx[6]);
    			}

    			if (dirty & /*humidity*/ 8) set_data_dev(t19, /*humidity*/ ctx[3]);
    			if (dirty & /*wind*/ 16) set_data_dev(t23, /*wind*/ ctx[4]);
    			if (dirty & /*uv*/ 32) set_data_dev(t27, /*uv*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:2) {#if $currentWeather !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let if_block = /*$currentWeather*/ ctx[12] !== "" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			add_location(main, file$1, 19, 0, 457);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$currentWeather*/ ctx[12] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $currentWeather;
    	validate_store(currentWeather, "currentWeather");
    	component_subscribe($$self, currentWeather, $$value => $$invalidate(12, $currentWeather = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, []);
    	let { temp } = $$props;
    	let { conditionText } = $$props;
    	let { locationName } = $$props;
    	let { humidity } = $$props;
    	let { wind } = $$props;
    	let { uv } = $$props;
    	let { conditionTextIcon } = $$props;
    	let { dayName } = $$props;
    	let { dayNumber } = $$props;
    	let { month } = $$props;
    	let { hours } = $$props;
    	let { minutes } = $$props;

    	const writable_props = [
    		"temp",
    		"conditionText",
    		"locationName",
    		"humidity",
    		"wind",
    		"uv",
    		"conditionTextIcon",
    		"dayName",
    		"dayNumber",
    		"month",
    		"hours",
    		"minutes"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("temp" in $$props) $$invalidate(0, temp = $$props.temp);
    		if ("conditionText" in $$props) $$invalidate(1, conditionText = $$props.conditionText);
    		if ("locationName" in $$props) $$invalidate(2, locationName = $$props.locationName);
    		if ("humidity" in $$props) $$invalidate(3, humidity = $$props.humidity);
    		if ("wind" in $$props) $$invalidate(4, wind = $$props.wind);
    		if ("uv" in $$props) $$invalidate(5, uv = $$props.uv);
    		if ("conditionTextIcon" in $$props) $$invalidate(6, conditionTextIcon = $$props.conditionTextIcon);
    		if ("dayName" in $$props) $$invalidate(7, dayName = $$props.dayName);
    		if ("dayNumber" in $$props) $$invalidate(8, dayNumber = $$props.dayNumber);
    		if ("month" in $$props) $$invalidate(9, month = $$props.month);
    		if ("hours" in $$props) $$invalidate(10, hours = $$props.hours);
    		if ("minutes" in $$props) $$invalidate(11, minutes = $$props.minutes);
    	};

    	$$self.$capture_state = () => ({
    		MONTH,
    		currentWeather,
    		DAYS,
    		temp,
    		conditionText,
    		locationName,
    		humidity,
    		wind,
    		uv,
    		conditionTextIcon,
    		dayName,
    		dayNumber,
    		month,
    		hours,
    		minutes,
    		$currentWeather
    	});

    	$$self.$inject_state = $$props => {
    		if ("temp" in $$props) $$invalidate(0, temp = $$props.temp);
    		if ("conditionText" in $$props) $$invalidate(1, conditionText = $$props.conditionText);
    		if ("locationName" in $$props) $$invalidate(2, locationName = $$props.locationName);
    		if ("humidity" in $$props) $$invalidate(3, humidity = $$props.humidity);
    		if ("wind" in $$props) $$invalidate(4, wind = $$props.wind);
    		if ("uv" in $$props) $$invalidate(5, uv = $$props.uv);
    		if ("conditionTextIcon" in $$props) $$invalidate(6, conditionTextIcon = $$props.conditionTextIcon);
    		if ("dayName" in $$props) $$invalidate(7, dayName = $$props.dayName);
    		if ("dayNumber" in $$props) $$invalidate(8, dayNumber = $$props.dayNumber);
    		if ("month" in $$props) $$invalidate(9, month = $$props.month);
    		if ("hours" in $$props) $$invalidate(10, hours = $$props.hours);
    		if ("minutes" in $$props) $$invalidate(11, minutes = $$props.minutes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		temp,
    		conditionText,
    		locationName,
    		humidity,
    		wind,
    		uv,
    		conditionTextIcon,
    		dayName,
    		dayNumber,
    		month,
    		hours,
    		minutes,
    		$currentWeather
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			temp: 0,
    			conditionText: 1,
    			locationName: 2,
    			humidity: 3,
    			wind: 4,
    			uv: 5,
    			conditionTextIcon: 6,
    			dayName: 7,
    			dayNumber: 8,
    			month: 9,
    			hours: 10,
    			minutes: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*temp*/ ctx[0] === undefined && !("temp" in props)) {
    			console.warn("<Card> was created without expected prop 'temp'");
    		}

    		if (/*conditionText*/ ctx[1] === undefined && !("conditionText" in props)) {
    			console.warn("<Card> was created without expected prop 'conditionText'");
    		}

    		if (/*locationName*/ ctx[2] === undefined && !("locationName" in props)) {
    			console.warn("<Card> was created without expected prop 'locationName'");
    		}

    		if (/*humidity*/ ctx[3] === undefined && !("humidity" in props)) {
    			console.warn("<Card> was created without expected prop 'humidity'");
    		}

    		if (/*wind*/ ctx[4] === undefined && !("wind" in props)) {
    			console.warn("<Card> was created without expected prop 'wind'");
    		}

    		if (/*uv*/ ctx[5] === undefined && !("uv" in props)) {
    			console.warn("<Card> was created without expected prop 'uv'");
    		}

    		if (/*conditionTextIcon*/ ctx[6] === undefined && !("conditionTextIcon" in props)) {
    			console.warn("<Card> was created without expected prop 'conditionTextIcon'");
    		}

    		if (/*dayName*/ ctx[7] === undefined && !("dayName" in props)) {
    			console.warn("<Card> was created without expected prop 'dayName'");
    		}

    		if (/*dayNumber*/ ctx[8] === undefined && !("dayNumber" in props)) {
    			console.warn("<Card> was created without expected prop 'dayNumber'");
    		}

    		if (/*month*/ ctx[9] === undefined && !("month" in props)) {
    			console.warn("<Card> was created without expected prop 'month'");
    		}

    		if (/*hours*/ ctx[10] === undefined && !("hours" in props)) {
    			console.warn("<Card> was created without expected prop 'hours'");
    		}

    		if (/*minutes*/ ctx[11] === undefined && !("minutes" in props)) {
    			console.warn("<Card> was created without expected prop 'minutes'");
    		}
    	}

    	get temp() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set temp(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get conditionText() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set conditionText(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get locationName() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set locationName(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get humidity() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set humidity(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wind() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wind(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uv() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uv(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get conditionTextIcon() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set conditionTextIcon(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayName() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayName(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayNumber() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayNumber(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get month() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hours() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hours(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minutes() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minutes(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const CONDITION_TEXT_SOLEADO = "Soleado";
    const CONDITION_TEXT_DESPEJADO = "Despejado";
    const CONDITION_TEXT_PARCIALMENTE_NUBLADO = "Parcialmente nublado";
    const CONDITION_TEXT_NUBLADO = "Nublado";
    const CONDITION_TEXT_CIELO_CUBIERTO = "Cielo cubierto";
    const CONDITION_TEXT_CIELO_TORMENTOSO_EN_LAS_APROXIMACIONES =
      "Cielos tormentosos en las aproximaciones";
    const CONDITION_TEXT_NEBLINA = "Neblina";
    const CONDITION_TEXT_LLUVIA_MODERADA = "Lluvia  moderada a intervalos";
    const CONDITION_TEXT_NIEVE_MODERADA =
      "Nieve moderada a intervalos en las aproximaciones";
    const CONDITION_TEXT_AGUA_NIEVE =
      "Aguanieve moderada a intervalos en las aproximaciones";

    const CONDITION_TEXT_CIELOS_TORMENTOSOS_APROXIMACIONES =
      "Cielos tormentosos en las aproximaciones";

    const CONDITION_TEXT_CHUBASCO_NIEVE = "Chubascos de nieve";

    const CONDITION_TEXT_LLOVISNA_INTERVALOS = "Llovizna a intervalos";
    const CONDITION_TEXT_LLOVISNA = "Llovizna";
    const CONDITION_TEXT_LLOVISNA_HELADA = "Llovizna helada";
    const CONDITION_TEXT_LIGERAS_LLUVIAS = "Ligeras lluvias";
    const CONDITION_TEXT_NIEVE_TORMENTA =
      "Nieve moderada o fuertes nevadas con tormenta en la región";
    const CONDITION_TEXT_NIEVE_LIGERA = "Ligeras precipitaciones de aguanieve";

    const CONDITION_TEXT_FUERTES_LLUVIAS = "Fuertes lluvias";

    const getIconsCard = (is_day, conditionText) => {
      let conditionTextIcon = "";
      if (is_day === 1) {
        switch (conditionText) {
          case CONDITION_TEXT_SOLEADO:
            conditionTextIcon = "day";
            break;
          case CONDITION_TEXT_PARCIALMENTE_NUBLADO:
            conditionTextIcon = "cloudy-day-1";
            break;
          case CONDITION_TEXT_NUBLADO:
            conditionTextIcon = "snowy-4";
            break;
          case CONDITION_TEXT_CIELO_CUBIERTO:
            conditionTextIcon = "cloudy";
            break;
          case CONDITION_TEXT_CIELO_TORMENTOSO_EN_LAS_APROXIMACIONES:
            conditionTextIcon = "cloudy";
            break;
          case CONDITION_TEXT_NEBLINA:
            conditionTextIcon = "cloudy";
            break;
          case CONDITION_TEXT_LLUVIA_MODERADA:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_NIEVE_MODERADA:
            conditionTextIcon = "snowy-6";
            break;
          case CONDITION_TEXT_AGUA_NIEVE:
            conditionTextIcon = "snowy-6";
            break;
          case CONDITION_TEXT_CIELOS_TORMENTOSOS_APROXIMACIONES:
            conditionTextIcon = "thunder";
            break;
          case CONDITION_TEXT_CHUBASCO_NIEVE:
            conditionTextIcon = "snowy-6";
            break;
          case CONDITION_TEXT_LLOVISNA_INTERVALOS:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_LLOVISNA:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_LLOVISNA_HELADA:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_LIGERAS_LLUVIAS:
            conditionTextIcon = "rainy-6";
          case CONDITION_TEXT_NIEVE_TORMENTA:
            conditionTextIcon = "thunder";
          case CONDITION_TEXT_NIEVE_LIGERA:
            conditionTextIcon = "snowy-6";
            break;
          case CONDITION_TEXT_FUERTES_LLUVIAS:
            conditionTextIcon = "rainy-6";
            break;
          default:
            conditionTextIcon = "cloudy";
            break;
        }
      } else {
        switch (conditionText) {
          case CONDITION_TEXT_DESPEJADO:
            conditionTextIcon = "night";
            break;
          case CONDITION_TEXT_PARCIALMENTE_NUBLADO:
            conditionTextIcon = "cloudy-night-1";
            break;
          case CONDITION_TEXT_NUBLADO:
            conditionTextIcon = "snowy-4";
            break;
          case CONDITION_TEXT_CIELO_CUBIERTO:
            conditionTextIcon = "cloudy";
            break;
          case CONDITION_TEXT_CIELO_TORMENTOSO_EN_LAS_APROXIMACIONES:
            conditionTextIcon = "cloudy";
            break;
          case CONDITION_TEXT_NEBLINA:
            conditionTextIcon = "cloudy";
            break;
          case CONDITION_TEXT_LLUVIA_MODERADA:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_NIEVE_MODERADA:
            conditionTextIcon = "snowy-6";
          case CONDITION_TEXT_AGUA_NIEVE:
            conditionTextIcon = "snowy-6";
            break;
          case CONDITION_TEXT_CIELOS_TORMENTOSOS_APROXIMACIONES:
            conditionTextIcon = "thunder";
            break;
          case CONDITION_TEXT_CHUBASCO_NIEVE:
            conditionTextIcon = "snowy-6";
            break;
          case CONDITION_TEXT_LLOVISNA_INTERVALOS:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_LLOVISNA:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_LLOVISNA_HELADA:
            conditionTextIcon = "rainy-4";
            break;
          case CONDITION_TEXT_LIGERAS_LLUVIAS:
            conditionTextIcon = "rainy-6";
          case CONDITION_TEXT_NIEVE_TORMENTA:
            conditionTextIcon = "thunder";
          case CONDITION_TEXT_NIEVE_LIGERA:
            conditionTextIcon = "snowy-6";
            break;
          case CONDITION_TEXT_FUERTES_LLUVIAS:
            conditionTextIcon = "rainy-6";
            break;
          default:
            conditionTextIcon = "cloudy";
            break;
        }
      }

      return conditionTextIcon;
    };

    /* src/components/CurrentWeatherDay.svelte generated by Svelte v3.32.1 */
    const file$2 = "src/components/CurrentWeatherDay.svelte";

    // (35:2) {#if $currentWeather !== null}
    function create_if_block$1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				temp: /*$currentWeather*/ ctx[0].current.temp_c,
    				conditionText: /*$currentWeather*/ ctx[0].current.condition.text,
    				locationName: /*locationName*/ ctx[7],
    				humidity: /*$currentWeather*/ ctx[0].current.humidity,
    				wind: /*$currentWeather*/ ctx[0].current.wind_kph,
    				uv: /*$currentWeather*/ ctx[0].current.uv,
    				conditionTextIcon: /*conditionTextIcon*/ ctx[6],
    				dayName: /*dayName*/ ctx[1],
    				month: /*month*/ ctx[3],
    				hours: /*hours*/ ctx[4],
    				minutes: /*minutes*/ ctx[5],
    				dayNumber: /*dayNumber*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*$currentWeather*/ 1) card_changes.temp = /*$currentWeather*/ ctx[0].current.temp_c;
    			if (dirty & /*$currentWeather*/ 1) card_changes.conditionText = /*$currentWeather*/ ctx[0].current.condition.text;
    			if (dirty & /*locationName*/ 128) card_changes.locationName = /*locationName*/ ctx[7];
    			if (dirty & /*$currentWeather*/ 1) card_changes.humidity = /*$currentWeather*/ ctx[0].current.humidity;
    			if (dirty & /*$currentWeather*/ 1) card_changes.wind = /*$currentWeather*/ ctx[0].current.wind_kph;
    			if (dirty & /*$currentWeather*/ 1) card_changes.uv = /*$currentWeather*/ ctx[0].current.uv;
    			if (dirty & /*conditionTextIcon*/ 64) card_changes.conditionTextIcon = /*conditionTextIcon*/ ctx[6];
    			if (dirty & /*dayName*/ 2) card_changes.dayName = /*dayName*/ ctx[1];
    			if (dirty & /*month*/ 8) card_changes.month = /*month*/ ctx[3];
    			if (dirty & /*hours*/ 16) card_changes.hours = /*hours*/ ctx[4];
    			if (dirty & /*minutes*/ 32) card_changes.minutes = /*minutes*/ ctx[5];
    			if (dirty & /*dayNumber*/ 4) card_changes.dayNumber = /*dayNumber*/ ctx[2];
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(35:2) {#if $currentWeather !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let current;
    	let if_block = /*$currentWeather*/ ctx[0] !== null && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			add_location(main, file$2, 33, 0, 1172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$currentWeather*/ ctx[0] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$currentWeather*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $currentWeather;
    	validate_store(currentWeather, "currentWeather");
    	component_subscribe($$self, currentWeather, $$value => $$invalidate(0, $currentWeather = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CurrentWeatherDay", slots, []);
    	let dayName = "";
    	let dayNumber = "";
    	let month = "";
    	let hours = "";
    	let minutes = "";
    	let conditionTextIcon = "";
    	let locationName = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CurrentWeatherDay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Card,
    		currentWeather,
    		getIconsCard,
    		MONTH,
    		DAYS,
    		dayName,
    		dayNumber,
    		month,
    		hours,
    		minutes,
    		conditionTextIcon,
    		locationName,
    		$currentWeather
    	});

    	$$self.$inject_state = $$props => {
    		if ("dayName" in $$props) $$invalidate(1, dayName = $$props.dayName);
    		if ("dayNumber" in $$props) $$invalidate(2, dayNumber = $$props.dayNumber);
    		if ("month" in $$props) $$invalidate(3, month = $$props.month);
    		if ("hours" in $$props) $$invalidate(4, hours = $$props.hours);
    		if ("minutes" in $$props) $$invalidate(5, minutes = $$props.minutes);
    		if ("conditionTextIcon" in $$props) $$invalidate(6, conditionTextIcon = $$props.conditionTextIcon);
    		if ("locationName" in $$props) $$invalidate(7, locationName = $$props.locationName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentWeather*/ 1) {
    			 if ($currentWeather !== null) {
    				$$invalidate(6, conditionTextIcon = getIconsCard($currentWeather.current.is_day, $currentWeather.current.condition.text));
    				$$invalidate(2, dayNumber = new Date($currentWeather.location.localtime).getDate());
    				const selectMonth = new Date($currentWeather.location.localtime).getMonth();
    				$$invalidate(3, month = MONTH[selectMonth].name);
    				const selectDay = new Date($currentWeather.location.localtime).getDay();
    				$$invalidate(1, dayName = DAYS[selectDay].name);
    				$$invalidate(4, hours = new Date($currentWeather.location.localtime).getHours());
    				$$invalidate(5, minutes = new Date($currentWeather.location.localtime).getMinutes());

    				$$invalidate(7, locationName = $currentWeather.location.name === "Liniers"
    				? "Rosario"
    				: $currentWeather.location.name);
    			}
    		}
    	};

    	return [
    		$currentWeather,
    		dayName,
    		dayNumber,
    		month,
    		hours,
    		minutes,
    		conditionTextIcon,
    		locationName
    	];
    }

    class CurrentWeatherDay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CurrentWeatherDay",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.1 */
    const file$3 = "src/App.svelte";

    // (39:4) {#if $currentWeather !== null}
    function create_if_block$2(ctx) {
    	let currentweatherday;
    	let current;
    	currentweatherday = new CurrentWeatherDay({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(currentweatherday.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(currentweatherday, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(currentweatherday.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(currentweatherday.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(currentweatherday, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(39:4) {#if $currentWeather !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let div;
    	let autocomplete;
    	let t;
    	let current;
    	autocomplete = new AutoComplete({ $$inline: true });
    	let if_block = /*$currentWeather*/ ctx[0] !== null && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(autocomplete.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "container");
    			add_location(div, file$3, 36, 2, 815);
    			add_location(main, file$3, 35, 0, 806);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(autocomplete, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$currentWeather*/ ctx[0] !== null) {
    				if (if_block) {
    					if (dirty & /*$currentWeather*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(autocomplete);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function errorGeolocation() {
    	
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $currentWeather;
    	validate_store(currentWeather, "currentWeather");
    	component_subscribe($$self, currentWeather, $$value => $$invalidate(0, $currentWeather = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const currentPositionOptions = {
    		enableHighAccuracy: false,
    		maximumAge: 30000,
    		timeout: 3000
    	};

    	let weatherCurrent = {
    		id: 0,
    		temp: "-",
    		humidity: "",
    		windSpeed: ""
    	};

    	if ("geolocation" in navigator) {
    		navigator.geolocation.getCurrentPosition(successGeolocation, errorGeolocation, currentPositionOptions);
    	}

    	async function successGeolocation(position) {
    		setCurrentWeather(position.coords.latitude, position.coords.longitude);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AutoComplete,
    		CurrentWeatherDay,
    		currentWeather,
    		setCurrentWeather,
    		currentPositionOptions,
    		weatherCurrent,
    		successGeolocation,
    		errorGeolocation,
    		$currentWeather
    	});

    	$$self.$inject_state = $$props => {
    		if ("weatherCurrent" in $$props) weatherCurrent = $$props.weatherCurrent;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$currentWeather];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
