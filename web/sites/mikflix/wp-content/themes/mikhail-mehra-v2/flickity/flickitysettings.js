(function($) {

var tapArea, startX;
            tapArea = document.querySelectorAll('.sliderOpen');
            startX = 0;
            for (var item of tapArea) {
                item.ontouchstart = function(e) {
                    startX = e.touches[0].clientX;
                };
                item.ontouchmove = function(e) {
                    if (Math.abs(e.touches[0].clientX - startX) > 5 && e.cancelable ) {
                        e.preventDefault();
                    }
                };
            }

function flickInit(selector, options) {
    var elem = document.querySelector(selector);
    if (!elem) return null;
    var existing = Flickity.data(elem);
    if (existing) existing.destroy();
    return new Flickity(elem, options);
}

// two-finger trackpad swipe: a horizontal-dominant wheel gesture advances
// the *main* viewer (.slideN) rather than the nav strip (.mikN) directly —
// .mikN's own asNavFor link keeps its selected thumb in sync automatically,
// same as it already does when you click a thumbnail. Listening on .mikN
// (not .slideN) because that's the horizontally-scrollable strip a trackpad
// swipe reads as "this scrolls sideways"; a vertical-dominant gesture is
// left alone so the page can still scroll normally.
function attachSwipe(navEl, mainFlkty) {
    if (!navEl || !mainFlkty) return;
    var cooldown = false;
    navEl.addEventListener('wheel', function(e) {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        if (cooldown) return;
        cooldown = true;
        if (e.deltaX > 0) mainFlkty.next(); else mainFlkty.previous();
        setTimeout(function() { cooldown = false; }, 260);
    }, { passive: false });
}

var slide1 = flickInit('.slide1', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik1', { asNavFor: '.slide1', initialIndex: 3, pageDots: false, freeScroll: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, touchVerticalScroll: false, groupCells: '85%', cellAlign: 'left', bgLazyLoad: true });
var slide2 = flickInit('.slide2', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik2', { asNavFor: '.slide2', pageDots: false, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', bgLazyLoad: true, touchVerticalScroll: false });
var slide3 = flickInit('.slide3', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik3', { asNavFor: '.slide3', pageDots: false, freeScroll: true, bgLazyLoad: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', touchVerticalScroll: false });
var slide4 = flickInit('.slide4', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik4', { asNavFor: '.slide4', pageDots: false, freeScroll: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', bgLazyLoad: true, touchVerticalScroll: false });
var slide5 = flickInit('.slide5', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik5', { asNavFor: '.slide5', pageDots: false, freeScroll: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', touchVerticalScroll: false });

attachSwipe(document.querySelector('.mik1'), slide1);
attachSwipe(document.querySelector('.mik2'), slide2);
attachSwipe(document.querySelector('.mik3'), slide3);
attachSwipe(document.querySelector('.mik4'), slide4);
attachSwipe(document.querySelector('.mik5'), slide5);

var resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        ['.mik1', '.mik2', '.mik3', '.mik4', '.mik5'].forEach(function(sel) {
            var el = document.querySelector(sel);
            var flkty = el && Flickity.data(el);
            if (flkty) flkty.resize();
        });
    }, 250);
});

})(jQuery);
