(function($) {
$(document).on('click','.sliderOpen',function(){
		$(this).toggleClass('closeToggle');
		$('.slideInfo').removeClass('active');
    $(this).parentsUntil( ".carouselcontainer" ).next().addClass('active');
		$('.sliderOpen').not( ".is-selected.is-nav-selected" ).removeClass('closeToggle');
});
$('.is-selected.is-nav-selected').click(function () {
    $(this).parentsUntil( ".carouselcontainer" ).next().removeClass('active');
});
$(document).on('click','.closeToggle',function(){
    $('.slideInfo').removeClass('active');
		$('.sliderOpen').removeClass('closeToggle');
});
$(document).on('click','.closeSlider',function(){
		 $('.slideInfo').removeClass('active');
});
})(jQuery);
