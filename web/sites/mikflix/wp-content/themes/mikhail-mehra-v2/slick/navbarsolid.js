(function($) {
$(document).ready(function() {
        // Transition effect for navbar
        $(window).scroll(function() {
          // checks if window is scrolled more than 500px, adds/removes solid class
          if($(this).scrollTop() > 60) {
              $('.bg-primary').addClass('solid');
          } else {
              $('.bg-primary').removeClass('solid');
          }
        });
});
})(jQuery);
