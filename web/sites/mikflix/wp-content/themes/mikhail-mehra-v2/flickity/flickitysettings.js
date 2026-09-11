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

flickInit('.slide1', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik1', { asNavFor: '.slide1', initialIndex: 3, pageDots: false, freeScroll: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, touchVerticalScroll: false, groupCells: '85%', cellAlign: 'left', bgLazyLoad: true });
flickInit('.slide2', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik2', { asNavFor: '.slide2', pageDots: false, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', bgLazyLoad: true, touchVerticalScroll: false });
flickInit('.slide3', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik3', { asNavFor: '.slide3', pageDots: false, freeScroll: true, bgLazyLoad: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', touchVerticalScroll: false });
flickInit('.slide4', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik4', { asNavFor: '.slide4', pageDots: false, freeScroll: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', bgLazyLoad: true, touchVerticalScroll: false });
flickInit('.slide5', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik5', { asNavFor: '.slide5', pageDots: false, freeScroll: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 4, groupCells: '85%', cellAlign: 'left', touchVerticalScroll: false });
flickInit('.slide6', { prevNextButtons: false, fade: true, lazyLoad: 1 });
flickInit('.mik6', { asNavFor: '.slide6', pageDots: false, freeScroll: true, wrapAround: true, setGallerySize: false, lazyLoad: 6, initialIndex: 0, groupCells: '85%', cellAlign: 'left', bgLazyLoad: true, touchVerticalScroll: false });

var resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        ['.mik1', '.mik2', '.mik3', '.mik4', '.mik5', '.mik6'].forEach(function(sel) {
            var el = document.querySelector(sel);
            var flkty = el && Flickity.data(el);
            if (flkty) flkty.resize();
        });
    }, 250);
});

})(jQuery);
