
/*!
 * Bootstrap v4.3.1 (https://getbootstrap.com/)
 * Copyright 2011-2019 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
!(function(t, e) {
  'object' == typeof exports && 'undefined' != typeof module
    ? e(exports, require('jquery'), require('popper.js'))
    : 'function' == typeof define && define.amd
    ? define(['exports', 'jquery', 'popper.js'], e)
    : e(((t = t || self).bootstrap = {}), t.jQuery, t.Popper);
})(this, function(t, g, u) {
  'use strict';
  function i(t, e) {
    for (var n = 0; n < e.length; n++) {
      var i = e[n];
      (i.enumerable = i.enumerable || !1),
        (i.configurable = !0),
        'value' in i && (i.writable = !0),
        Object.defineProperty(t, i.key, i);
    }
  }
  function s(t, e, n) {
    return e && i(t.prototype, e), n && i(t, n), t;
  }
  function l(o) {
    for (var t = 1; t < arguments.length; t++) {
      var r = null != arguments[t] ? arguments[t] : {},
        e = Object.keys(r);
      'function' == typeof Object.getOwnPropertySymbols &&
        (e = e.concat(
          Object.getOwnPropertySymbols(r).filter(function(t) {
            return Object.getOwnPropertyDescriptor(r, t).enumerable;
          })
        )),
        e.forEach(function(t) {
          var e, n, i;
          (e = o),
            (i = r[(n = t)]),
            n in e
              ? Object.defineProperty(e, n, { value: i, enumerable: !0, configurable: !0, writable: !0 })
              : (e[n] = i);
        });
    }
    return o;
  }
  (g = g && g.hasOwnProperty('default') ? g.default : g), (u = u && u.hasOwnProperty('default') ? u.default : u);
  var e = 'transitionend';
  function n(t) {
    var e = this,
      n = !1;
    return (
      g(this).one(_.TRANSITION_END, function() {
        n = !0;
      }),
      setTimeout(function() {
        n || _.triggerTransitionEnd(e);
      }, t),
      this
    );
  }
  var _ = {
    TRANSITION_END: 'bsTransitionEnd',
    getUID: function(t) {
      for (; (t += ~~(1e6 * Math.random())), document.getElementById(t); );
      return t;
    },
    getSelectorFromElement: function(t) {
      var e = t.getAttribute('data-target');
      if (!e || '#' === e) {
        var n = t.getAttribute('href');
        e = n && '#' !== n ? n.trim() : '';
      }
      try {
        return document.querySelector(e) ? e : null;
      } catch (t) {
        return null;
      }
    },
    getTransitionDurationFromElement: function(t) {
      if (!t) return 0;
      var e = g(t).css('transition-duration'),
        n = g(t).css('transition-delay'),
        i = parseFloat(e),
        o = parseFloat(n);
      return i || o ? ((e = e.split(',')[0]), (n = n.split(',')[0]), 1e3 * (parseFloat(e) + parseFloat(n))) : 0;
    },
    reflow: function(t) {
      return t.offsetHeight;
    },
    triggerTransitionEnd: function(t) {
      g(t).trigger(e);
    },
    supportsTransitionEnd: function() {
      return Boolean(e);
    },
    isElement: function(t) {
      return (t[0] || t).nodeType;
    },
    typeCheckConfig: function(t, e, n) {
      for (var i in n)
        if (Object.prototype.hasOwnProperty.call(n, i)) {
          var o = n[i],
            r = e[i],
            s =
              r && _.isElement(r)
                ? 'element'
                : ((a = r),
                  {}.toString
                    .call(a)
                    .match(/\s([a-z]+)/i)[1]
                    .toLowerCase());
          if (!new RegExp(o).test(s))
            throw new Error(
              t.toUpperCase() + ': Option "' + i + '" provided type "' + s + '" but expected type "' + o + '".'
            );
        }
      var a;
    },
    findShadowRoot: function(t) {
      if (!document.documentElement.attachShadow) return null;
      if ('function' != typeof t.getRootNode)
        return t instanceof ShadowRoot ? t : t.parentNode ? _.findShadowRoot(t.parentNode) : null;
      var e = t.getRootNode();
      return e instanceof ShadowRoot ? e : null;
    }
  };
  (g.fn.emulateTransitionEnd = n),
    (g.event.special[_.TRANSITION_END] = {
      bindType: e,
      delegateType: e,
      handle: function(t) {
        if (g(t.target).is(this)) return t.handleObj.handler.apply(this, arguments);
      }
    });
  var o = 'alert',
    r = 'bs.alert',
    a = '.' + r,
    c = g.fn[o],
    h = { CLOSE: 'close' + a, CLOSED: 'closed' + a, CLICK_DATA_API: 'click' + a + '.data-api' },
    f = 'alert',
    d = 'fade',
    m = 'show',
    p = (function() {
      function i(t) {
        this._element = t;
      }
      var t = i.prototype;
      return (
        (t.close = function(t) {
          var e = this._element;
          t && (e = this._getRootElement(t)), this._triggerCloseEvent(e).isDefaultPrevented() || this._removeElement(e);
        }),
        (t.dispose = function() {
          g.removeData(this._element, r), (this._element = null);
        }),
        (t._getRootElement = function(t) {
          var e = _.getSelectorFromElement(t),
            n = !1;
          return e && (n = document.querySelector(e)), n || (n = g(t).closest('.' + f)[0]), n;
        }),
        (t._triggerCloseEvent = function(t) {
          var e = g.Event(h.CLOSE);
          return g(t).trigger(e), e;
        }),
        (t._removeElement = function(e) {
          var n = this;
          if ((g(e).removeClass(m), g(e).hasClass(d))) {
            var t = _.getTransitionDurationFromElement(e);
            g(e)
              .one(_.TRANSITION_END, function(t) {
                return n._destroyElement(e, t);
              })
              .emulateTransitionEnd(t);
          } else this._destroyElement(e);
        }),
        (t._destroyElement = function(t) {
          g(t)
            .detach()
            .trigger(h.CLOSED)
            .remove();
        }),
        (i._jQueryInterface = function(n) {
          return this.each(function() {
            var t = g(this),
              e = t.data(r);
            e || ((e = new i(this)), t.data(r, e)), 'close' === n && e[n](this);
          });
        }),
        (i._handleDismiss = function(e) {
          return function(t) {
            t && t.preventDefault(), e.close(this);
          };
        }),
        s(i, null, [
          {
            key: 'VERSION',
            get: function() {
              return '4.3.1';
            }
          }
        ]),
        i
      );
    })();
  g(document).on(h.CLICK_DATA_API, '[data-dismiss="alert"]', p._handleDismiss(new p())),
    (g.fn[o] = p._jQueryInterface),
    (g.fn[o].Constructor = p),
    (g.fn[o].noConflict = function() {
      return (g.fn[o] = c), p._jQueryInterface;
    });
  var v = 'button',
    y = 'bs.button',
    E = '.' + y,
    C = '.data-api',
    T = g.fn[v],
    S = 'active',
    b = 'btn',
    I = 'focus',
    D = '[data-toggle^="button"]',
    w = '[data-toggle="buttons"]',
    A = 'input:not([type="hidden"])',
    N = '.active',
    O = '.btn',
    k = { CLICK_DATA_API: 'click' + E + C, FOCUS_BLUR_DATA_API: 'focus' + E + C + ' blur' + E + C },
    P = (function() {
      function n(t) {
        this._element = t;
      }
      var t = n.prototype;
      return (
        (t.toggle = function() {
          var t = !0,
            e = !0,
            n = g(this._element).closest(w)[0];
          if (n) {
            var i = this._element.querySelector(A);
            if (i) {
              if ('radio' === i.type)
                if (i.checked && this._element.classList.contains(S)) t = !1;
                else {
                  var o = n.querySelector(N);
                  o && g(o).removeClass(S);
                }
              if (t) {
                if (
                  i.hasAttribute('disabled') ||
                  n.hasAttribute('disabled') ||
                  i.classList.contains('disabled') ||
                  n.classList.contains('disabled')
                )
                  return;
                (i.checked = !this._element.classList.contains(S)), g(i).trigger('change');
              }
              i.focus(), (e = !1);
            }
          }
          e && this._element.setAttribute('aria-pressed', !this._element.classList.contains(S)),
            t && g(this._element).toggleClass(S);
        }),
        (t.dispose = function() {
          g.removeData(this._element, y), (this._element = null);
        }),
        (n._jQueryInterface = function(e) {
          return this.each(function() {
            var t = g(this).data(y);
            t || ((t = new n(this)), g(this).data(y, t)), 'toggle' === e && t[e]();
          });
        }),
        s(n, null, [
          {
            key: 'VERSION',
            get: function() {
              return '4.3.1';
            }
          }
        ]),
        n
      );
    })();
  g(document)
    .on(k.CLICK_DATA_API, D, function(t) {
      t.preventDefault();
      var e = t.target;
      g(e).hasClass(b) || (e = g(e).closest(O)), P._jQueryInterface.call(g(e), 'toggle');
    })
    .on(k.FOCUS_BLUR_DATA_API, D, function(t) {
      var e = g(t.target).closest(O)[0];
      g(e).toggleClass(I, /^focus(in)?$/.test(t.type));
    }),
    (g.fn[v] = P._jQueryInterface),
    (g.fn[v].Constructor = P),
    (g.fn[v].noConflict = function() {
      return (g.fn[v] = T), P._jQueryInterface;
    });
  var L = 'carousel',
    j = 'bs.carousel',
    H = '.' + j,
    R = '.data-api',
    x = g.fn[L],
    F = { interval: 5e3, keyboard: !0, slide: !1, pause: 'hover', wrap: !0, touch: !0 },
    U = {
      interval: '(number|boolean)',
      keyboard: 'boolean',
      slide: '(boolean|string)',
      pause: '(string|boolean)',
      wrap: 'boolean',
      touch: 'boolean'
    },
    W = 'next',
    q = 'prev',
    M = 'left',
    K = 'right',
    Q = {
      SLIDE: 'slide' + H,
      SLID: 'slid' + H,
      KEYDOWN: 'keydown' + H,
      MOUSEENTER: 'mouseenter' + H,
      MOUSELEAVE: 'mouseleave' + H,
      TOUCHSTART: 'touchstart' + H,
      TOUCHMOVE: 'touchmove' + H,
      TOUCHEND: 'touchend' + H,
      POINTERDOWN: 'pointerdown' + H,
      POINTERUP: 'pointerup' + H,
      DRAG_START: 'dragstart' + H,
      LOAD_DATA_API: 'load' + H + R,
      CLICK_DATA_API: 'click' + H + R
    },
    B = 'carousel',
    V = 'active',
    Y = 'slide',
    z = 'carousel-item-right',
    X = 'carousel-item-left',
    $ = 'carousel-item-next',
    G = 'carousel-item-prev',
    J = 'pointer-event',
    Z = '.active',
    tt = '.active.carousel-item',
    et = '.carousel-item',
    nt = '.carousel-item img',
    it = '.carousel-item-next, .carousel-item-prev',
    ot = '.carousel-indicators',
    rt = '[data-slide], [data-slide-to]',
    st = '[data-ride="carousel"]',
    at = { TOUCH: 'touch', PEN: 'pen' },
    lt = (function() {
      function r(t, e) {
        (this._items = null),
          (this._interval = null),
          (this._activeElement = null),
          (this._isPaused = !1),
          (this._isSliding = !1),
          (this.touchTimeout = null),
          (this.touchStartX = 0),
          (this.touchDeltaX = 0),
          (this._config = this._getConfig(e)),
          (this._element = t),
          (this._indicatorsElement = this._element.querySelector(ot)),
          (this._touchSupported = 'ontouchstart' in document.documentElement || 0 < navigator.maxTouchPoints),
          (this._pointerEvent = Boolean(window.PointerEvent || window.MSPointerEvent)),
          this._addEventListeners();
      }
      var t = r.prototype;
      return (
        (t.next = function() {
          this._isSliding || this._slide(W);
        }),
        (t.nextWhenVisible = function() {
          !document.hidden &&
            g(this._element).is(':visible') &&
            'hidden' !== g(this._element).css('visibility') &&
            this.next();
        }),
        (t.prev = function() {
          this._isSliding || this._slide(q);
        }),
        (t.pause = function(t) {
          t || (this._isPaused = !0),
            this._element.querySelector(it) && (_.triggerTransitionEnd(this._element), this.cycle(!0)),
            clearInterval(this._interval),
            (this._interval = null);
        }),
        (t.cycle = function(t) {
          t || (this._isPaused = !1),
            this._interval && (clearInterval(this._interval), (this._interval = null)),
            this._config.interval &&
              !this._isPaused &&
              (this._interval = setInterval(
                (document.visibilityState ? this.nextWhenVisible : this.next).bind(this),
                this._config.interval
              ));
        }),
        (t.to = function(t) {
          var e = this;
          this._activeElement = this._element.querySelector(tt);
          var n = this._getItemIndex(this._activeElement);
          if (!(t > this._items.length - 1 || t < 0))
            if (this._isSliding)
              g(this._element).one(Q.SLID, function() {
                return e.to(t);
              });
            else {
              if (n === t) return this.pause(), void this.cycle();
              var i = n < t ? W : q;
              this._slide(i, this._items[t]);
            }
        }),
        (t.dispose = function() {
          g(this._element).off(H),
            g.removeData(this._element, j),
            (this._items = null),
            (this._config = null),
            (this._element = null),
            (this._interval = null),
            (this._isPaused = null),
            (this._isSliding = null),
            (this._activeElement = null),
            (this._indicatorsElement = null);
        }),
        (t._getConfig = function(t) {
          return (t = l({}, F, t)), _.typeCheckConfig(L, t, U), t;
        }),
        (t._handleSwipe = function() {
          var t = Math.abs(this.touchDeltaX);
          if (!(t <= 40)) {
            var e = t / this.touchDeltaX;
            0 < e && this.prev(), e < 0 && this.next();
          }
        }),
        (t._addEventListeners = function() {
          var e = this;
          this._config.keyboard &&
            g(this._element).on(Q.KEYDOWN, function(t) {
              return e._keydown(t);
            }),
            'hover' === this._config.pause &&
              g(this._element)
                .on(Q.MOUSEENTER, function(t) {
                  return e.pause(t);
                })
                .on(Q.MOUSELEAVE, function(t) {
                  return e.cycle(t);
                }),
            this._config.touch && this._addTouchEventListeners();
        }),
        (t._addTouchEventListeners = function() {
          var n = this;
          if (this._touchSupported) {
            var e = function(t) {
                n._pointerEvent && at[t.originalEvent.pointerType.toUpperCase()]
                  ? (n.touchStartX = t.originalEvent.clientX)
                  : n._pointerEvent || (n.touchStartX = t.originalEvent.touches[0].clientX);
              },
              i = function(t) {
                n._pointerEvent &&
                  at[t.originalEvent.pointerType.toUpperCase()] &&
                  (n.touchDeltaX = t.originalEvent.clientX - n.touchStartX),
                  n._handleSwipe(),
                  'hover' === n._config.pause &&
                    (n.pause(),
                    n.touchTimeout && clearTimeout(n.touchTimeout),
                    (n.touchTimeout = setTimeout(function(t) {
                      return n.cycle(t);
                    }, 500 + n._config.interval)));
              };
            g(this._element.querySelectorAll(nt)).on(Q.DRAG_START, function(t) {
              return t.preventDefault();
            }),
              this._pointerEvent
                ? (g(this._element).on(Q.POINTERDOWN, function(t) {
                    return e(t);
                  }),
                  g(this._element).on(Q.POINTERUP, function(t) {
                    return i(t);
                  }),
                  this._element.classList.add(J))
                : (g(this._element).on(Q.TOUCHSTART, function(t) {
                    return e(t);
                  }),
                  g(this._element).on(Q.TOUCHMOVE, function(t) {
                    var e;
                    (e = t).originalEvent.touches && 1 < e.originalEvent.touches.length
                      ? (n.touchDeltaX = 0)
                      : (n.touchDeltaX = e.originalEvent.touches[0].clientX - n.touchStartX);
                  }),
                  g(this._element).on(Q.TOUCHEND, function(t) {
                    return i(t);
                  }));
          }
        }),
        (t._keydown = function(t) {
          if (!/input|textarea/i.test(t.target.tagName))
            switch (t.which) {
              case 37:
                t.preventDefault(), this.prev();
                break;
              case 39:
                t.preventDefault(), this.next();
            }
        }),
        (t._getItemIndex = function(t) {
          return (
            (this._items = t && t.parentNode ? [].slice.call(t.parentNode.querySelectorAll(et)) : []),
            this._items.indexOf(t)
          );
        }),
        (t._getItemByDirection = function(t, e) {
          var n = t === W,
            i = t === q,
            o = this._getItemIndex(e),
            r = this._items.length - 1;
          if (((i && 0 === o) || (n && o === r)) && !this._config.wrap) return e;
          var s = (o + (t === q ? -1 : 1)) % this._items.length;
          return -1 === s ? this._items[this._items.length - 1] : this._items[s];
        }),
        (t._triggerSlideEvent = function(t, e) {
          var n = this._getItemIndex(t),
            i = this._getItemIndex(this._element.querySelector(tt)),
            o = g.Event(Q.SLIDE, { relatedTarget: t, direction: e, from: i, to: n });
          return g(this._element).trigger(o), o;
        }),
        (t._setActiveIndicatorElement = function(t) {
          if (this._indicatorsElement) {
            var e = [].slice.call(this._indicatorsElement.querySelectorAll(Z));
            g(e).removeClass(V);
            var n = this._indicatorsElement.children[this._getItemIndex(t)];
            n && g(n).addClass(V);
          }
        }),
        (t._slide = function(t, e) {
          var n,
            i,
            o,
            r = this,
            s = this._element.querySelector(tt),
            a = this._getItemIndex(s),
            l = e || (s && this._getItemByDirection(t, s)),
            c = this._getItemIndex(l),
            h = Boolean(this._interval);
          if (((o = t === W ? ((n = X), (i = $), M) : ((n = z), (i = G), K)), l && g(l).hasClass(V)))
            this._isSliding = !1;
          else if (!this._triggerSlideEvent(l, o).isDefaultPrevented() && s && l) {
            (this._isSliding = !0), h && this.pause(), this._setActiveIndicatorElement(l);
            var u = g.Event(Q.SLID, { relatedTarget: l, direction: o, from: a, to: c });
            if (g(this._element).hasClass(Y)) {
              g(l).addClass(i), _.reflow(l), g(s).addClass(n), g(l).addClass(n);
              var f = parseInt(l.getAttribute('data-interval'), 10);
              this._config.interval = f
                ? ((this._config.defaultInterval = this._config.defaultInterval || this._config.interval), f)
                : this._config.defaultInterval || this._config.interval;
              var d = _.getTransitionDurationFromElement(s);
              g(s)
                .one(_.TRANSITION_END, function() {
                  g(l)
                    .removeClass(n + ' ' + i)
                    .addClass(V),
                    g(s).removeClass(V + ' ' + i + ' ' + n),
                    (r._isSliding = !1),
                    setTimeout(function() {
                      return g(r._element).trigger(u);
                    }, 0);
                })
                .emulateTransitionEnd(d);
            } else g(s).removeClass(V), g(l).addClass(V), (this._isSliding = !1), g(this._element).trigger(u);
            h && this.cycle();
          }
        }),
        (r._jQueryInterface = function(i) {
          return this.each(function() {
            var t = g(this).data(j),
              e = l({}, F, g(this).data());
            'object' == typeof i && (e = l({}, e, i));
            var n = 'string' == typeof i ? i : e.slide;
            if ((t || ((t = new r(this, e)), g(this).data(j, t)), 'number' == typeof i)) t.to(i);
            else if ('string' == typeof n) {
              if ('undefined' == typeof t[n]) throw new TypeError('No method named "' + n + '"');
              t[n]();
            } else e.interval && e.ride && (t.pause(), t.cycle());
          });
        }),
        (r._dataApiClickHandler = function(t) {
          var e = _.getSelectorFromElement(this);
          if (e) {
            var n = g(e)[0];
            if (n && g(n).hasClass(B)) {
              var i = l({}, g(n).data(), g(this).data()),
                o = this.getAttribute('data-slide-to');
              o && (i.interval = !1),
                r._jQueryInterface.call(g(n), i),
                o &&
                  g(n)
                    .data(j)
                    .to(o),
                t.preventDefault();
            }
          }
        }),
        s(r, null, [
          {
            key: 'VERSION',
            get: function() {
              return '4.3.1';
            }
          },
          {
            key: 'Default',
            get: function() {
              return F;
            }
          }
        ]),
        r
      );
    })();
  g(document).on(Q.CLICK_DATA_API, rt, lt._dataApiClickHandler),
    g(window).on(Q.LOAD_DATA_API, function() {
      for (var t = [].slice.call(document.querySelectorAll(st)), e = 0, n = t.length; e < n; e++) {
        var i = g(t[e]);
        lt._jQueryInterface.call(i, i.data());
      }
    }),
    (g.fn[L] = lt._jQueryInterface),
    (g.fn[L].Constructor = lt),
    (g.fn[L].noConflict = function() {
      return (g.fn[L] = x), lt._jQueryInterface;
    });
  var ct = 'collapse',
    ht = 'bs.collapse',
    ut = '.' + ht,
    ft = g.fn[ct],
    dt = { toggle: !0, parent: '' },
    gt = { toggle: 'boolean', parent: '(string|element)' },
    _t = {
      SHOW: 'show' + ut,
      SHOWN: 'shown' + ut,
      HIDE: 'hide' + ut,
      HIDDEN: 'hidden' + ut,
      CLICK_DATA_API: 'click' + ut + '.data-api'
    },
    mt = 'show',
    pt = 'collapse',
    vt = 'collapsing',
    yt = 'collapsed',
    Et = 'width',
    Ct = 'height',
    Tt = '.show, .collapsing',
    St = '[data-toggle="collapse"]',
    bt = (function() {
      function a(e, t) {
        (this._isTransitioning = !1),
          (this._element = e),
          (this._config = this._getConfig(t)),
          (this._triggerArray = [].slice.call(
            document.querySelectorAll(
              '[data-toggle="collapse"][href="#' + e.id + '"],[data-toggle="collapse"][data-target="#' + e.id + '"]'
            )
          ));
        for (var n = [].slice.call(document.querySelectorAll(St)), i = 0, o = n.length; i < o; i++) {
          var r = n[i],
            s = _.getSelectorFromElement(r),
            a = [].slice.call(document.querySelectorAll(s)).filter(function(t) {
              return t === e;
            });
          null !== s && 0 < a.length && ((this._selector = s), this._triggerArray.push(r));
        }
        (this._parent = this._config.parent ? this._getParent() : null),
          this._config.parent || this._addAriaAndCollapsedClass(this._element, this._triggerArray),
          this._config.toggle && this.toggle();
      }
      var t = a.prototype;
      return (
        (t.toggle = function() {
          g(this._element).hasClass(mt) ? this.hide() : this.show();
        }),
        (t.show = function() {
          var t,
            e,
            n = this;
          if (
            !this._isTransitioning &&
            !g(this._element).hasClass(mt) &&
            (this._parent &&
              0 ===
                (t = [].slice.call(this._parent.querySelectorAll(Tt)).filter(function(t) {
                  return 'string' == typeof n._config.parent
                    ? t.getAttribute('data-parent') === n._config.parent
                    : t.classList.contains(pt);
                })).length &&
              (t = null),
            !(
              t &&
              (e = g(t)
                .not(this._selector)
                .data(ht)) &&
              e._isTransitioning
            ))
          ) {
            var i = g.Event(_t.SHOW);
            if ((g(this._element).trigger(i), !i.isDefaultPrevented())) {
              t && (a._jQueryInterface.call(g(t).not(this._selector), 'hide'), e || g(t).data(ht, null));
              var o = this._getDimension();
              g(this._element)
                .removeClass(pt)
                .addClass(vt),
                (this._element.style[o] = 0),
                this._triggerArray.length &&
                  g(this._triggerArray)
                    .removeClass(yt)
                    .attr('aria-expanded', !0),
                this.setTransitioning(!0);
              var r = 'scroll' + (o[0].toUpperCase() + o.slice(1)),
                s = _.getTransitionDurationFromElement(this._element);
              g(this._element)
                .one(_.TRANSITION_END, function() {
                  g(n._element)
                    .removeClass(vt)
                    .addClass(pt)
                    .addClass(mt),
                    (n._element.style[o] = ''),
                    n.setTransitioning(!1),
                    g(n._element).trigger(_t.SHOWN);
                })
                .emulateTransitionEnd(s),
                (this._element.style[o] = this._element[r] + 'px');
            }
          }
        }),
        (t.hide = function() {
          var t = this;
          if (!this._isTransitioning && g(this._element).hasClass(mt)) {
            var e = g.Event(_t.HIDE);
            if ((g(this._element).trigger(e), !e.isDefaultPrevented())) {
              var n = this._getDimension();
              (this._element.style[n] = this._element.getBoundingClientRect()[n] + 'px'),
                _.reflow(this._element),
                g(this._element)
                  .addClass(vt)
                  .removeClass(pt)
                  .removeClass(mt);
              var i = this._triggerArray.length;
              if (0 < i)
                for (var o = 0; o < i; o++) {
                  var r = this._triggerArray[o],
                    s = _.getSelectorFromElement(r);
                  if (null !== s)
                    g([].slice.call(document.querySelectorAll(s))).hasClass(mt) ||
                      g(r)
                        .addClass(yt)
                        .attr('aria-expanded', !1);
                }
              this.setTransitioning(!0);
              this._element.style[n] = '';
              var a = _.getTransitionDurationFromElement(this._element);
              g(this._element)
                .one(_.TRANSITION_END, function() {
                  t.setTransitioning(!1),
                    g(t._element)
                      .removeClass(vt)
                      .addClass(pt)
                      .trigger(_t.HIDDEN);
                })
                .emulateTransitionEnd(a);
            }
          }
        }),
        (t.setTransitioning = function(t) {
          this._isTransitioning = t;
        }),
        (t.dispose = function() {
          g.removeData(this._element, ht),
            (this._config = null),
            (this._parent = null),
            (this._element = null),
            (this._triggerArray = null),
            (this._isTransitioning = null);
        }),
        (t._getConfig = function(t) {
          return ((t = l({}, dt, t)).toggle = Boolean(t.toggle)), _.typeCheckConfig(ct, t, gt), t;
        }),
        (t._getDimension = function() {
          return g(this._element).hasClass(Et) ? Et : Ct;
        }),
        (t._getParent = function() {
          var t,
            n = this;
          _.isElement(this._config.parent)
            ? ((t = this._config.parent),
              'undefined' != typeof this._config.parent.jquery && (t = this._config.parent[0]))
            : (t = document.querySelector(this._config.parent));
          var e = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]',
            i = [].slice.call(t.querySelectorAll(e));
          return (
            g(i).each(function(t, e) {
              n._addAriaAndCollapsedClass(a._getTargetFromElement(e), [e]);
            }),
            t
          );
        }),
        (t._addAriaAndCollapsedClass = function(t, e) {
          var n = g(t).hasClass(mt);
          e.length &&
            g(e)
              .toggleClass(yt, !n)
              .attr('aria-expanded', n);
        }),
        (a._getTargetFromElement = function(t) {
          var e = _.getSelectorFromElement(t);
          return e ? document.querySelector(e) : null;
        }),
        (a._jQueryInterface = function(i) {
          return this.each(function() {
            var t = g(this),
              e = t.data(ht),
              n = l({}, dt, t.data(), 'object' == typeof i && i ? i : {});
            if (
              (!e && n.toggle && /show|hide/.test(i) && (n.toggle = !1),
              e || ((e = new a(this, n)), t.data(ht, e)),
              'string' == typeof i)
            ) {
              if ('undefined' == typeof e[i]) throw new TypeError('No method named "' + i + '"');
              e[i]();
            }
          });
        }),
        s(a, null, [
          {
            key: 'VERSION',
            get: function() {
              return '4.3.1';