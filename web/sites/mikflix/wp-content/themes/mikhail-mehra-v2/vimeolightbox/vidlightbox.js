(function($) {
$('body')
.on('click', '.video-launch', function () {
  var videoID   = $(this).data('video-id'),
      videoType = $(this).data('video-type'),
      src;
  if ( videoType === 'youtube' ) {
    src = 'https://www.youtube.com/embed/' + videoID + '?autoplay=1&rel=0';
  } else {
    src = 'https://player.vimeo.com/video/' + videoID + '/?title=1&byline=1&playsinline=0&portrait=0&autoplay=1';
  }
  var $video = '<div id="vimeo-pop-container"><div><span class="vimeo-close closeSlider"><i class="fas fa-times"></i></span><iframe src="' + src + '" width="500" height="281" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>';
  $('body').append($video);
} )
.on('click', '.vimeo-launch', function () {
  var videoID = $(this).data('vimeo-id'),
      src = 'https://player.vimeo.com/video/' + videoID + '/?title=1&byline=1&playsinline=0&portrait=0&autoplay=1',
      $video = '<div id="vimeo-pop-container"><div><span class="vimeo-close closeSlider"><i class="fas fa-times"></i></span><iframe src="' + src + '" width="500" height="281" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>';
  $('body').append($video);
} )
.on('click', '.vimeo-close', function () {
  $(this).addClass('closing');
  $('#vimeo-pop-container').delay(700).animate({
    height: 0,
    top: '50%'
  }, 'fast', function () {
    $('#vimeo-pop-container').remove();
  });
} );
})(jQuery);
